"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require('cors');
const postsRouter = require('./routes/posts');
const downloadRouter = require('./routes/download');
var app = express();
var PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use('/api/posts', postsRouter);
app.use('/api/download', downloadRouter);
app.listen(PORT, function () {
    console.log("Backend server running on port ".concat(PORT));
});
// Middleware global de manejo de errores (siempre responde JSON)
app.use(function (err, req, res, next) {
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
