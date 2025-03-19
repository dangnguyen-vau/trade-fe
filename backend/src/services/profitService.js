const { getAccessToken } = require('../services');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function getProfitData(params) {
    const token = await getAccessToken();

    try {
        // Gọi api chứa accesstoekn
        const result = await axios({
            method: 'GET',
            url: 'http://103.216.117.117:82/api/v1/profit',
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
        const filePath = path.join(dirPath, 'profit.json');
        fs.writeFileSync(filePath, JSON.stringify(result.data, null, 2), 'utf8');

        console.log(`Dữ liệu đã được lưu vào ${filePath}`);

        return result.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu profit:', error.message);
        throw error;
    }
}

// Hàm lấy dữ liệu từ file local
function getLocalProfitData() {
    try {
        const filePath = path.join(__dirname, '..', 'DataBot', 'profit.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Lỗi khi đọc file profit.json:', error.message);
        return null;
    }
}

module.exports = {
    getLocalProfitData,
    getProfitData,
}