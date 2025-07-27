const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/posts?source=rule34&tags=akiko&page=1',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    if (res.statusCode === 200) {
      const posts = JSON.parse(data);
      const firstPost = posts[0];
      console.log('=== RULE34 FIRST POST ===');
      console.log('ID:', firstPost.id);
      console.log('Source:', firstPost.source);
      console.log('Artists field:', firstPost.artists);
      console.log('Artists array?', Array.isArray(firstPost.artists));
      console.log('Artists length:', firstPost.artists?.length);
      console.log('First 5 tags:', firstPost.tags?.slice(0, 5));
    } else {
      console.log('Error response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
