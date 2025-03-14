const express = require('express');
const router = require('./src/router');
const cors = require('cors');

// Khởi tạo Express app
const app = express();

// Middleware cơ bản
app.use(express.json());
app.use(cors()); // Cho phép CORS

// Sử dụng router cho đường dẫn /api/trades
app.use('/', (req, res, next) => {
  console.log('Request đến: ', req.method, req.url);
  next();
}, router);

// Endpoint gốc cho API
app.get('/', (req, res) => {
  res.json({ message: 'Trade API Server' });
});

module.exports = app;