import express, { Request, Response, NextFunction } from 'express';
const cors = require('cors');
const postsRouter = require('./routes/posts');
import downloadRouter from './routes/download';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/posts', postsRouter);
app.use('/api/download', downloadRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// Middleware global de manejo de errores (siempre responde JSON)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[GLOBAL ERROR] Middleware:', {
    error: err,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers,
    ip: req.ip
  });
  res.status(500).json({ error: 'Internal Server Error', details: String(err) });
  console.log('[GLOBAL ERROR] JSON error response sent');
});
