require('dotenv').config();
const express = require('express');
const { getJson } = require('serpapi');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SERPAPI_KEY;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getCacheFilePath(authorId) {
  const dateStr = getTodayDateString();
  return path.join(DATA_DIR, `${authorId}_${dateStr}.json`);
}

async function fetchAllArticles(authorId) {
  let allArticles = [];
  let start = 0;
  let authorInfo = null;
  let citedBy = null;
  let graph = null;
  let publicAccess = null;
  let coAuthors = null;

  while (true) {
    console.log(`Fetching articles starting at ${start}...`);

    const json = await new Promise((resolve, reject) => {
      getJson(
        {
          api_key: API_KEY,
          engine: 'google_scholar_author',
          hl: 'en',
          author_id: authorId,
          num: '100',
          start: String(start),
        },
        (result) => resolve(result),
      );
    });

    // Store author info and metrics from first request
    if (!authorInfo) {
      authorInfo = json.author;
      citedBy = json.cited_by;
      graph = json.graph;
      publicAccess = json.public_access;
      coAuthors = json.co_authors;
    }

    // Add articles from this page
    if (json.articles && json.articles.length > 0) {
      allArticles = allArticles.concat(json.articles);
      console.log(
        `  Found ${json.articles.length} articles (total: ${allArticles.length})`,
      );
    }

    // Check if there are more pages
    if (json.serpapi_pagination && json.serpapi_pagination.next) {
      start += 100;
    } else {
      break;
    }
  }

  return {
    author: authorInfo,
    cited_by: citedBy,
    graph: graph,
    public_access: publicAccess,
    co_authors: coAuthors,
    articles: allArticles,
    fetched_at: new Date().toISOString(),
  };
}

// Helper function to get or fetch author data
async function getOrFetchAuthorData(authorId) {
  const cacheFile = getCacheFilePath(authorId);

  // Check if we have a cached file from today
  if (fs.existsSync(cacheFile)) {
    console.log(`Using cached data from ${cacheFile}`);
    const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    return { source: 'cache', data: cachedData };
  }

  // Fetch fresh data
  console.log(`Fetching fresh data for author: ${authorId}`);
  const data = await fetchAllArticles(authorId);

  // Save to cache
  fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
  console.log(`Data cached to ${cacheFile}`);

  return { source: 'api', data };
}

// GET /author/:authorId - Full author information
app.get('/author/:authorId', async (req, res) => {
  const { authorId } = req.params;

  if (!authorId) {
    return res.status(400).json({ error: 'Author ID is required' });
  }

  try {
    const result = await getOrFetchAuthorData(authorId);
    return res.json(result);
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json({ error: 'Failed to fetch scholar data' });
  }
});

// GET /citations/:authorId - Total citation count
app.get('/citations/:authorId', async (req, res) => {
  const { authorId } = req.params;

  if (!authorId) {
    return res.status(400).json({ error: 'Author ID is required' });
  }

  try {
    const result = await getOrFetchAuthorData(authorId);
    const citedBy = result.data.cited_by;
    const citations = citedBy?.table?.[0]?.citations?.all || 0;
    const citationsSince2021 = citedBy?.table?.[0]?.citations?.since_2021 || 0;

    return res.json({
      source: result.source,
      citations: {
        all: citations,
        since_2021: citationsSince2021,
      },
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json({ error: 'Failed to fetch scholar data' });
  }
});

// GET /h-index/:authorId - H-index
app.get('/h-index/:authorId', async (req, res) => {
  const { authorId } = req.params;

  if (!authorId) {
    return res.status(400).json({ error: 'Author ID is required' });
  }

  try {
    const result = await getOrFetchAuthorData(authorId);
    const citedBy = result.data.cited_by;
    const hIndex = citedBy?.table?.[1]?.h_index?.all || 0;
    const hIndexSince2021 = citedBy?.table?.[1]?.h_index?.since_2021 || 0;

    return res.json({
      source: result.source,
      h_index: {
        all: hIndex,
        since_2021: hIndexSince2021,
      },
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json({ error: 'Failed to fetch scholar data' });
  }
});

// GET /papers/:authorId - List of papers
app.get('/papers/:authorId', async (req, res) => {
  const { authorId } = req.params;

  if (!authorId) {
    return res.status(400).json({ error: 'Author ID is required' });
  }

  try {
    const result = await getOrFetchAuthorData(authorId);
    const papers = result.data.articles.map((article) => ({
      title: article.title,
      authors: article.authors,
      publication: article.publication,
      year: article.year,
      cited_by: article.cited_by?.value || 0,
    }));

    return res.json({
      source: result.source,
      total: papers.length,
      papers,
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json({ error: 'Failed to fetch scholar data' });
  }
});

// GET /all/:authorId - All data (full response)
app.get('/all/:authorId', async (req, res) => {
  const { authorId } = req.params;

  if (!authorId) {
    return res.status(400).json({ error: 'Author ID is required' });
  }

  try {
    const result = await getOrFetchAuthorData(authorId);
    return res.json(result);
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json({ error: 'Failed to fetch scholar data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  GET /author/:authorId   - Full author information`);
  console.log(`  GET /citations/:authorId - Citation count`);
  console.log(`  GET /h-index/:authorId   - H-index`);
  console.log(`  GET /papers/:authorId    - List of papers`);
  console.log(`  GET /all/:authorId       - All data`);
});
