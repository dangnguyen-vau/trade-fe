/**
 * Script để cập nhật dữ liệu từ tất cả các bot
 * Chạy script này để đồng bộ dữ liệu mới nhất từ các bot vào thư mục tổng hợp
 */

const { getAllBotConfigs } = require('../services');
const { getAllTradesData } = require('../services/tradeService');
const { getAllDailyData } = require('../services/TimeOver/dailyService');
const { getAllWeeklyData } = require('../services/TimeOver/weeklyService');
const { getAllMonthlyData } = require('../services/TimeOver/monthlyService');

async function updateAllData() {
    console.log('Bắt đầu cập nhật dữ liệu từ tất cả các bot...');
    
    try {
        // Lấy danh sách tất cả các bot
        const botConfigs = getAllBotConfigs();
        console.log(`Tìm thấy ${botConfigs.length} bots để cập nhật.`);
        
        // Cập nhật dữ liệu trades
        console.log('Đang cập nhật dữ liệu trades...');
        const tradesData = await getAllTradesData();
        console.log(`Đã cập nhật ${tradesData.trade_count} giao dịch từ tất cả các bot.`);
        
        // Cập nhật dữ liệu daily
        console.log('Đang cập nhật dữ liệu daily...');
        const dailyData = await getAllDailyData();
        console.log(`Đã cập nhật dữ liệu daily với ${dailyData.data.length} ngày từ tất cả các bot.`);
        
        // Cập nhật dữ liệu weekly
        console.log('Đang cập nhật dữ liệu weekly...');
        const weeklyData = await getAllWeeklyData();
        console.log(`Đã cập nhật dữ liệu weekly với ${weeklyData.data.length} tuần từ tất cả các bot.`);
        
        // Cập nhật dữ liệu monthly
        console.log('Đang cập nhật dữ liệu monthly...');
        const monthlyData = await getAllMonthlyData();
        console.log(`Đã cập nhật dữ liệu monthly với ${monthlyData.data.length} tháng từ tất cả các bot.`);
        
        console.log('Đã hoàn thành việc cập nhật dữ liệu từ tất cả các bot!');
    } catch (error) {
        console.error('Lỗi khi cập nhật dữ liệu:', error);
        process.exit(1);
    }
}

// Chạy hàm cập nhật
updateAllData(); 