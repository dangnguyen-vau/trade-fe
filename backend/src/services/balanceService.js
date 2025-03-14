const { getAccessToken } = require('../services');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function getBalanceData(params) {
    const token = await getAccessToken();

    try {
        // Gọi api chứa accesstoekn
        const result = await axios({
            method: 'GET',
            url: 'http://103.216.117.117:83/api/v1/balance',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        // Tạo folder DataBot nếu chưa tồn tại
        const dirPath = path.join(__dirname, '..', 'DataBot');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Lưu dữ liệu vào file trades.json
        const filePath = path.join(dirPath, 'balance.json');
        fs.writeFileSync(filePath, JSON.stringify(result.data, null, 2), 'utf8');

        console.log(`Dữ liệu đã được lưu vào ${filePath}`);

        return result.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu balance:', error.message);
        throw error;
    }
}

// Hàm lấy dữ liệu từ file local
function getLocalBalanceData() {
    try {
        const filePath = path.join(__dirname, '..', 'DataBot', 'balance.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Lỗi khi đọc file trades.json:', error.message);
        return null;
    }
}

module.exports = {
    getLocalBalanceData,
    getBalanceData
}