const express = require('express');
const axios = require('axios');

const router = express.Router();

// /api/download?url=...
router.get('/', async (req, res) => {
  const fileUrl = req.query.url as string;
  if (!fileUrl) {
    return res.status(400).send('Missing url parameter');
  }
  try {
    // Get file extension
    const extMatch = fileUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
    const ext = extMatch ? extMatch[1] : 'file';
    const filename = `post.${ext}`;
    // Fetch file
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    response.data.pipe(res);
  } catch (err) {
    res.status(500).send('Error downloading file');
  }
});

export default router;
