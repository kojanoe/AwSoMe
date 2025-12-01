// Simple test for content ratio calculator
// Run with: node test-simple.js

const fs = require('fs');
const path = require('path');

// Read the structured data
const dataPath = path.join(__dirname, '..', 'data', 'generatedData', 'structured-data.json');

if (!fs.existsSync(dataPath)) {
  console.error('❌ Error: structured-data.json not found!');
  console.error('Run the API first: http://localhost:3000/api/generate-data');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('🧪 Content Ratio Calculator Test\n');
console.log('='.repeat(60));

// Same logic as contentRatio.ts
const following = data.following || [];
const profileSearches = data.profileSearches || [];
const postsViewed = data.postsViewed || [];
const videosWatched = data.videosWatched || [];
const adsWatched = data.adsWatched || [];

// Create set of intended authors
const intendedAuthors = new Set();
following.forEach(f => intendedAuthors.add(f.author));
profileSearches.forEach(s => intendedAuthors.add(s.author));

// Create a Set of ads for quick lookup (author:timestamp)
const adsSet = new Set();
adsWatched.forEach(ad => {
  adsSet.add(`${ad.author}:${ad.timestamp}`);
});

// Combine all content and deduplicate by author + timestamp
const allContent = new Map();

[...postsViewed, ...videosWatched, ...adsWatched].forEach(item => {
  const key = `${item.author}:${item.timestamp}`;
  if (!allContent.has(key)) {
    allContent.set(key, { author: item.author, timestamp: item.timestamp });
  }
});

// Categorize each unique item
let intendedCount = 0;
let suggestedCount = 0;
let adsCount = 0;

allContent.forEach((item, key) => {
  // Priority 1: Is it an ad?
  if (adsSet.has(key)) {
    adsCount++;
  }
  // Priority 2: Is it intended content?
  else if (intendedAuthors.has(item.author)) {
    intendedCount++;
  }
  // Priority 3: It's suggested content
  else {
    suggestedCount++;
  }
});

// Calculate totals
const totalViewed = allContent.size;

// Calculate ratios (all against Total Viewed)
const intendedRatio = totalViewed > 0 ? intendedCount / totalViewed : 0;
const suggestedRatio = totalViewed > 0 ? suggestedCount / totalViewed : 0;
const adsRatio = totalViewed > 0 ? adsCount / totalViewed : 0;

// Calculate percentages
const intendedPercent = Math.round(intendedRatio * 100);
const suggestedPercent = Math.round(suggestedRatio * 100);
const adsPercent = Math.round(adsRatio * 100);

// Display results
console.log('\n📊 Results:');
console.log('-'.repeat(60));
console.log(`Total Viewed (deduplicated): ${totalViewed}`);
console.log(`  ├─ Intended:  ${intendedCount} (${intendedPercent}%)`);
console.log(`  ├─ Suggested: ${suggestedCount} (${suggestedPercent}%)`);
console.log(`  └─ Ads:       ${adsCount} (${adsPercent}%)`);

console.log('\n📈 Ratios:');
console.log('-'.repeat(60));
console.log(`Intended:  ${intendedRatio.toFixed(3)}`);
console.log(`Suggested: ${suggestedRatio.toFixed(3)}`);
console.log(`Ads:       ${adsRatio.toFixed(3)}`);
console.log(`Sum:       ${(intendedRatio + suggestedRatio + adsRatio).toFixed(3)} (should be 1.000)`);

console.log('\n🔍 Raw Data Counts:');
console.log('-'.repeat(60));
console.log(`Posts Viewed:    ${postsViewed.length}`);
console.log(`Videos Watched:  ${videosWatched.length}`);
console.log(`Ads Watched:     ${adsWatched.length}`);
console.log(`Total Raw:       ${postsViewed.length + videosWatched.length + adsWatched.length}`);
console.log(`After Dedup:     ${totalViewed}`);
console.log(`Duplicates:      ${(postsViewed.length + videosWatched.length + adsWatched.length) - totalViewed}`);

console.log('\n' + '='.repeat(60));
console.log('✅ Test complete!\n');