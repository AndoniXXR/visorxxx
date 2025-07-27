const axios = require('axios');

async function testArtistSearch() {
  console.log('=== TESTING ARTIST SEARCH ===');
  
  try {
    // Primero obtener posts de e621
    console.log('1. Fetching posts from e621...');
    const response = await axios.get('https://e621.net/posts.json?tags=solo+female&limit=1', {
      headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' }
    });
    
    const post = response.data.posts[0];
    console.log('Post ID:', post.id);
    console.log('Tags general:', post.tags.general.slice(0, 5));
    console.log('Tags artist:', post.tags.artist);
    
    // Ahora probar búsqueda de artistas
    console.log('\n2. Testing artist search...');
    for (const tag of post.tags.general.slice(0, 3)) {
      try {
        console.log(`Checking tag: ${tag}`);
        const artistRes = await axios.get(`https://e621.net/artists/${encodeURIComponent(tag)}.json`, {
          headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' },
          timeout: 3000
        });
        
        if (artistRes.data && artistRes.data.is_active) {
          console.log(`✅ Found artist: ${artistRes.data.name}`);
        } else {
          console.log(`❌ Tag "${tag}" exists but artist is not active`);
        }
      } catch (err) {
        console.log(`❌ Tag "${tag}" is not an artist (${err.response?.status || err.message})`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testArtistSearch();
