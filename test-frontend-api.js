const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/posts?source=e621&tags=akiko&page=1',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const posts = JSON.parse(data);
    const firstPost = posts[0];
    console.log('=== FIRST POST DATA ===');
    console.log('ID:', firstPost.id);
    console.log('Source:', firstPost.source);
    console.log('Artists field:', firstPost.artists);
    console.log('Artists type:', typeof firstPost.artists);
    console.log('Artists array?', Array.isArray(firstPost.artists));
    console.log('Artists length:', firstPost.artists?.length);
    console.log('Full post keys:', Object.keys(firstPost));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
