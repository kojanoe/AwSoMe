// Simple test for engagement ratio calculator
// Run with: node test-engagement.js

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

const TIME_WINDOW_SECONDS = 300; // 5 minutes

// Get data
const following = data.following || [];
const profileSearches = data.profileSearches || [];
const postsViewed = data.postsViewed || [];
const videosWatched = data.videosWatched || [];
const adsWatched = data.adsWatched || [];
const likedPosts = data.likedPosts || [];

// Create set of intended authors
const intendedAuthors = new Set();
following.forEach(f => intendedAuthors.add(f.author));
profileSearches.forEach(s => intendedAuthors.add(s.author));

// Create a Set of ads for quick lookup
const adsSet = new Set();
const adsList = [];
adsWatched.forEach(ad => {
  const key = `${ad.author}:${ad.timestamp}`;
  adsSet.add(key);
  adsList.push({ author: ad.author, timestamp: ad.timestamp });
});

// Combine all content and deduplicate
const allContent = new Map();

[...postsViewed, ...videosWatched, ...adsWatched].forEach(item => {
  const key = `${item.author}:${item.timestamp}`;
  if (!allContent.has(key)) {
    allContent.set(key, { 
      author: item.author, 
      timestamp: item.timestamp,
      isAd: adsSet.has(key)
    });
  }
});

// Filter for suggested content only (not ads, not intended)
const suggestedViewed = Array.from(allContent.values()).filter(
  item => !item.isAd && !intendedAuthors.has(item.author)
);

// Count likes on suggested content (within time window)
let suggestedLikedCount = 0;

likedPosts.forEach(like => {
  if (intendedAuthors.has(like.author)) {
    return; // Skip intended authors
  }

  // Check if this was in ads (ads take priority)
  const wasAd = adsList.some(ad =>
    ad.author === like.author &&
    ad.timestamp < like.timestamp &&
    (like.timestamp - ad.timestamp) <= TIME_WINDOW_SECONDS
  );

  if (wasAd) {
    return; // Don't count as suggested if it was an ad
  }

  // Find if this author was viewed recently before liking
  const wasViewedRecently = suggestedViewed.some(view => 
    view.author === like.author &&
    view.timestamp < like.timestamp &&
    (like.timestamp - view.timestamp) <= TIME_WINDOW_SECONDS
  );

  if (wasViewedRecently) {
    suggestedLikedCount++;
  }
});

// Count likes on ads (within time window)
let adsLikedCount = 0;

likedPosts.forEach(like => {
  const wasAdRecently = adsList.some(ad =>
    ad.author === like.author &&
    ad.timestamp < like.timestamp &&
    (like.timestamp - ad.timestamp) <= TIME_WINDOW_SECONDS
  );

  if (wasAdRecently) {
    adsLikedCount++;
  }
});

// Calculate engagement rates
const suggestedEngagementRate = suggestedViewed.length > 0
  ? suggestedLikedCount / suggestedViewed.length
  : 0;

const adsEngagementRate = adsList.length > 0
  ? adsLikedCount / adsList.length
  : 0;

// Calculate percentages
const suggestedPercent = Math.round(suggestedEngagementRate * 100);
const adsPercent = Math.round(adsEngagementRate * 100);

// Display results
console.log('🧪 Engagement Ratio Calculator Test\n');
console.log('='.repeat(60));

console.log('\n📊 Suggested Content Engagement:');
console.log('-'.repeat(60));
console.log(`Total Suggested Viewed: ${suggestedViewed.length}`);
console.log(`Liked (within 5 min):   ${suggestedLikedCount}`);
console.log(`Engagement Rate:        ${suggestedPercent}% (${suggestedEngagementRate.toFixed(3)})`);

console.log('\n📺 Ads Engagement:');
console.log('-'.repeat(60));
console.log(`Total Ads Viewed:       ${adsList.length}`);
console.log(`Liked (within 5 min):   ${adsLikedCount}`);
console.log(`Engagement Rate:        ${adsPercent}% (${adsEngagementRate.toFixed(3)})`);

console.log('\n💡 Summary:');
console.log('-'.repeat(60));
if (suggestedPercent > 10) {
  console.log(`You engage frequently with suggested content (${suggestedPercent}%)`);
} else if (suggestedPercent > 5) {
  console.log(`You moderately engage with suggested content (${suggestedPercent}%)`);
} else {
  console.log(`You rarely engage with suggested content (${suggestedPercent}%)`);
}

console.log('\n' + '='.repeat(60));
console.log(`✅ Test complete! (Time window: ${TIME_WINDOW_SECONDS} seconds)\n`);