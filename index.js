const dotenv = require('dotenv');
const SerpApi = require('google-search-results-nodejs');
const app = require('express')();
const PORT = process.env.PORT || 8080;
const cors = require('cors');
const _ = require('lodash');
const crypto = require('crypto');

function getAuthorInfo(author_id, timestamp) {
  return new Promise((resolve, reject) => {
    console.log(`Timestamp: ${timestamp}`);
    const params = {
      engine: 'google_scholar_author',
      author_id,
    };

    search.json(params, (data) => {
      if (!data.author) {
        reject('No authors found');
      } else {
        const name = data.author.name;
        const table = data.cited_by.table;
        const citations = table[0].citations.all;
        const h_index = table[1].h_index.all;
        const result = {
          name,
          author_id,
          citations,
          h_index,
        };
        resolve(result);
      }
    });
  });
}

function getHashDayMonth() {
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const md5 = crypto.createHmac('md5', `${day}_${month}`).digest('hex');
  return md5;
}

// Show result as JSON
dotenv.config();
if (!process.env.api_key) throw new Error('api_key not found');
const search = new SerpApi.GoogleSearch(process.env.api_key);

// Main

// Server ready
app.listen(PORT, () => {
  console.log('ready');
});
app.use(cors());

// Caching function calls
const wrap = _.memoize(getAuthorInfo);

app.get('/author/:scholarId', async (req, res) => {
  const author_id = req.params.scholarId;

  const timestamp = getHashDayMonth();
  if (wrap.cache.has(author_id, timestamp)) {
    // get the cached value
    wrap.cache
      .get(author_id, timestamp)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(() => res.status(404).send());
  } else {
    wrap(author_id, timestamp)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(() => res.status(404).send());
  }
});
