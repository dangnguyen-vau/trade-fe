const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Hàm để lấy access token
async function getAccessToken() {
  // Nếu token đã tồn tại trong biến môi trường, sử dụng nó
  if (process.env.ACCESS_TOKEN && process.env.TOKEN_EXPIRES_AT &&
    parseInt(process.env.TOKEN_EXPIRES_AT) > Date.now()) {
    console.log('Sử dụng token từ biến môi trường');
    return process.env.ACCESS_TOKEN;
  }

  try {
    const response = await axios({
      method: 'POST',
      url: 'http://103.216.117.117:82/api/v1/token/login',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ZnJlcXRyYWRlcjoxMjM0NTY=' // Base64 của "freqtrader:123456"
      }
    });

    const token = response.data.access_token;

    // Lưu token vào biến môi trường (runtime)
    process.env.ACCESS_TOKEN = token;
    process.env.TOKEN_EXPIRES_AT = (Date.now() + 3600000).toString();

    console.log('Token đã được lưu vào biến môi trường');
    return token;
  } catch (error) {
    console.error('Lỗi khi lấy access token:', error.message);
    throw error;
  }
}




module.exports = {
  getAccessToken,
};