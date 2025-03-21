const fs = require('fs');
const path = require('path');

// Đường dẫn gốc đến thư mục DataBot
const dataBotRoot = path.join(__dirname, '..', 'DataBot');

/**
 * Tạo cấu trúc thư mục cho một bot
 * @param {string} botId - ID của bot
 */
function createBotDirectoryStructure(botId) {
  // Tạo thư mục chính cho bot
  const botDir = path.join(dataBotRoot, botId);
  if (!fs.existsSync(botDir)) {
    fs.mkdirSync(botDir, { recursive: true });
  }

  // Tạo thư mục TimeOver
  const timeOverDir = path.join(botDir, 'TimeOver');
  if (!fs.existsSync(timeOverDir)) {
    fs.mkdirSync(timeOverDir, { recursive: true });
  }

  return {
    botDir,
    timeOverDir
  };
}

/**
 * Tạo cấu trúc thư mục cho dữ liệu tổng hợp
 */
function createConsolidatedDirectoryStructure() {
  // Tạo thư mục consolidated
  const consolidatedDir = path.join(dataBotRoot, 'consolidated');
  if (!fs.existsSync(consolidatedDir)) {
    fs.mkdirSync(consolidatedDir, { recursive: true });
  }

  // Tạo thư mục TimeOver trong consolidated
  const timeOverDir = path.join(consolidatedDir, 'TimeOver');
  if (!fs.existsSync(timeOverDir)) {
    fs.mkdirSync(timeOverDir, { recursive: true });
  }

  return {
    consolidatedDir,
    timeOverDir
  };
}

/**
 * Lưu dữ liệu JSON vào file
 * @param {string} filePath - Đường dẫn đến file
 * @param {Object} data - Dữ liệu cần lưu
 */
function saveJsonToFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Dữ liệu đã được lưu vào: ${filePath}`);
}

/**
 * Đọc dữ liệu JSON từ file
 * @param {string} filePath - Đường dẫn đến file
 * @returns {Object|null} Dữ liệu JSON hoặc null nếu có lỗi
 */
function readJsonFromFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`Lỗi khi đọc file ${filePath}:`, error.message);
    return null;
  }
}

module.exports = {
  createBotDirectoryStructure,
  createConsolidatedDirectoryStructure,
  saveJsonToFile,
  readJsonFromFile,
  dataBotRoot
}; 