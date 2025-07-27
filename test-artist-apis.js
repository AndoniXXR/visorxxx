const axios = require('axios');

async function testArtistData() {
  console.log('=== TESTING ARTIST DATA FROM APIs ===\n');
  
  try {
    // Test Rule34
    console.log('1. Testing Rule34...');
    const rule34Response = await axios.get('https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=akiko&limit=1');
    const rule34Post = rule34Response.data[0];
    console.log('Rule34 Post structure:');
    console.log('- ID:', rule34Post.id);
    console.log('- artist field:', rule34Post.artist);
    console.log('- tags:', rule34Post.tags.substring(0, 100) + '...');
    console.log('- All keys:', Object.keys(rule34Post));
    
    // Parse tags to find artist
    const rule34Tags = rule34Post.tags.split(' ');
    console.log('- First 10 tags:', rule34Tags.slice(0, 10));
    
  } catch (error) {
    console.error('Rule34 error:', error.message);
  }
  
  try {
    // Test XBooru
    console.log('\n2. Testing XBooru...');
    const xbooruResponse = await axios.get('https://xbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=solo&limit=1');
    const xbooruPosts = xbooruResponse.data;
    
    if (Array.isArray(xbooruPosts) && xbooruPosts.length > 0) {
      const xbooruPost = xbooruPosts[0];
      console.log('XBooru Post structure:');
      console.log('- ID:', xbooruPost.id);
      console.log('- artist field:', xbooruPost.artist);
      console.log('- tags:', xbooruPost.tags ? xbooruPost.tags.substring(0, 100) + '...' : 'No tags');
      console.log('- All keys:', Object.keys(xbooruPost));
      
      if (xbooruPost.tags) {
        const xbooruTags = xbooruPost.tags.split(' ');
        console.log('- First 10 tags:', xbooruTags.slice(0, 10));
      }
    } else {
      console.log('XBooru returned no posts or unexpected format');
    }
    
  } catch (error) {
    console.error('XBooru error:', error.message);
  }
}

testArtistData();
