const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = 3003;

// Kiểm tra thư mục build
const checkBuildFolder = async () => {
  const buildPath = path.join(__dirname, '..' ,'build');
  try {
    await fs.access(buildPath);
    console.log('Build folder exists');
  } catch (error) {
    console.error('Build folder does not exist. Please run npm run build first');
    process.exit(1);
  }
};

// Kiểm tra thư mục data
const checkDataFolder = async () => {
  const dataPath = path.join(__dirname, 'public', 'data');
  try {
    await fs.access(dataPath);
    console.log('Data folder exists');
  } catch (error) {
    console.error('Data folder does not exist at:', dataPath);
    process.exit(1);
  }
};

// Khởi động server sau khi kiểm tra
const startServer = async () => {
  try {
    await checkBuildFolder();
    await checkDataFolder();

    // Cho phép CORS
    app.use(cors());

    // Phục vụ các file tĩnh từ thư mục build và public
    app.use(express.static(path.join(__dirname, '..' ,'build')));
    app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

    // API endpoint để lấy danh sách các file JSON
    app.get('/api/data', async (req, res) => {
      try {
        const dataPath = path.join(__dirname, 'public', 'data');
        const files = await fs.readdir(dataPath);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        res.json(jsonFiles);
      } catch (error) {
        console.error('Error reading data directory:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // API endpoint để lấy nội dung của một file JSON cụ thể
    app.get('/api/data/:filename', async (req, res) => {
      try {
        const filePath = path.join(__dirname, 'public', 'data', req.params.filename);
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
      } catch (error) {
        console.error('Error reading JSON file:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Phục vụ index.html cho tất cả các route khác
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });

    // Xử lý lỗi 404
    app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Xử lý lỗi chung
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something broke!' });
    });

    // Khởi động server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api/data`);
      console.log(`Frontend available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Chạy server
startServer(); 