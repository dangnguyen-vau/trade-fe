const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { botConfigs, tokenExpirationTime } = require('./config/botConfig');

// Lưu trữ token của các bot khác nhau
const tokenStore = {};

/**
 * Hàm để lấy access token cho một bot cụ thể
 * @param {string} botId - ID của bot cần lấy token (nếu không cung cấp, sẽ dùng bot mặc định)
 * @returns {Promise<string>} Access token
 */
async function getAccessToken(botId = 'Default-Bot') {
  // Tìm cấu hình bot trong danh sách
  const botConfig = botConfigs.find(bot => bot.id === botId);
  if (!botConfig) {
    throw new Error(`Không tìm thấy cấu hình cho bot với id: ${botId}`);
  }

  // Kiểm tra xem token đã tồn tại và còn hạn không
  if (tokenStore[botId] && tokenStore[botId].expiresAt > Date.now()) {
    console.log(`Sử dụng token đã lưu cho bot ${botId}`);
    return tokenStore[botId].token;
  }

  // Nếu không có token bot hiện tại hoặc hết hạn thì api lấy accessToken
  try {
    const response = await axios({
      method: 'POST',
      url: `http://${botConfig.host}:${botConfig.port}/api/v1/token/login`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${botConfig.auth}`
      }
    });

    const token = response.data.access_token;

    // Lưu token vào store với thời gian hết hạn
    tokenStore[botId] = {
      token,
      expiresAt: Date.now() + tokenExpirationTime
    };

    console.log(`Token đã được lưu cho bot ${botId}`);
    return token;
  } catch (error) {
    console.error(`Lỗi khi lấy access token cho bot ${botId}:`, error.message);
    throw error;
  }
}

/**
 * Lấy danh sách cấu hình của tất cả các bot
 * @returns {Array} Danh sách cấu hình bot
 */
function getAllBotConfigs() {
  return botConfigs;
}

module.exports = {
  getAccessToken,
  getAllBotConfigs
};