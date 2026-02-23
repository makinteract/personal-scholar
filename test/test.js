const authorId = 'wVDtZB0AAAAJ';
const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('Testing Google Scholar API endpoints\n');
  console.log('='.repeat(50));

  // Test /author endpoint
  console.log('\n1. GET /author/:authorId');
  try {
    const res = await fetch(`${BASE_URL}/author/${authorId}`);
    const result = await res.json();
    console.log(`   Source: ${result.source}`);
    console.log(`   Name: ${result.data.author.name}`);
    console.log(`   Affiliations: ${result.data.author.affiliations}`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }

  // Test /citations endpoint
  console.log('\n2. GET /citations/:authorId');
  try {
    const res = await fetch(`${BASE_URL}/citations/${authorId}`);
    const result = await res.json();
    console.log(`   Source: ${result.source}`);
    console.log(`   Total citations: ${result.citations.all}`);
    console.log(`   Citations since 2021: ${result.citations.since_2021}`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }

  // Test /h-index endpoint
  console.log('\n3. GET /h-index/:authorId');
  try {
    const res = await fetch(`${BASE_URL}/h-index/${authorId}`);
    const result = await res.json();
    console.log(`   Source: ${result.source}`);
    console.log(`   H-index: ${result.h_index.all}`);
    console.log(`   H-index since 2021: ${result.h_index.since_2021}`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }

  // Test /papers endpoint
  console.log('\n4. GET /papers/:authorId');
  try {
    const res = await fetch(`${BASE_URL}/papers/${authorId}`);
    const result = await res.json();
    console.log(`   Source: ${result.source}`);
    console.log(`   Total papers: ${result.total}`);
    console.log(`   First 3 papers:`);
    result.papers.slice(0, 3).forEach((paper, i) => {
      console.log(`     ${i + 1}. ${paper.title} (${paper.year})`);
    });
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }

  // Test /all endpoint
  console.log('\n5. GET /all/:authorId');
  try {
    const res = await fetch(`${BASE_URL}/all/${authorId}`);
    const result = await res.json();
    console.log(`   Source: ${result.source}`);
    console.log(`   Author: ${result.data.author.name}`);
    console.log(`   Total articles: ${result.data.articles.length}`);
  } catch (err) {
    console.error(`   Error: ${err.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Tests completed');
}

testEndpoints();
