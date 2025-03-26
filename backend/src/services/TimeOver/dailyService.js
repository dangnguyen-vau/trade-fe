const { getAccessToken, getAllBotConfigs } = require('../../services');
const axios = require('axios');
const path = require('path');
const { 
  createBotDirectoryStructure, 
  createConsolidatedDirectoryStructure, 
  saveJsonToFile, 
  readJsonFromFile 
} = require('../../utils/fileUtils');

/**
 * Lấy dữ liệu thống kê hàng ngày từ một bot cụ thể
 * @param {string} botId - ID của bot
 * @returns {Promise<Object>} Dữ liệu thống kê hàng ngày
 */
async function getBotDailyData(botId) {
    try {
        const token = await getAccessToken(botId);
        const botConfig = getAllBotConfigs().find(config => config.id === botId);
        
        // Gọi API để lấy dữ liệu
        const result = await axios({
            method: 'GET',
            url: `http://${botConfig.host}:${botConfig.port}/api/v1/daily?timescale=20`,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        // Tạo cấu trúc thư mục cho bot
        const { timeOverDir } = createBotDirectoryStructure(botId);
        
        // Thêm trường botId vào dữ liệu
        const dataWithBotId = {
            ...result.data,
            botId: botId,
            botName: botConfig.name
        };

        // Lưu dữ liệu vào file daily.json cho bot cụ thể
        const filePath = path.join(timeOverDir, 'daily.json');
        saveJsonToFile(filePath, dataWithBotId);

        return dataWithBotId;
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu daily cho bot ${botId}:`, error.message);
        throw error;
    }
}

/**
 * Tổng hợp dữ liệu thống kê hàng ngày từ tất cả các bot
 * @returns {Promise<Object>} Dữ liệu thống kê hàng ngày tổng hợp
 */
async function getAllDailyData() {
    try {
        const botConfigs = getAllBotConfigs();
        const allDailyPromises = botConfigs.map(config => getBotDailyData(config.id));
        
        // Chờ tất cả các promise hoàn thành
        const allDailyResults = await Promise.all(allDailyPromises);
        
        // Lấy tất cả các ngày duy nhất từ tất cả các bot
        const allDates = Array.from(
            new Set(
                allDailyResults.flatMap(result => 
                    (result.data || []).map(item => item.date)
                )
            )
        ).sort();

        // Tổng hợp dữ liệu từ tất cả các bot cho mỗi ngày
        const consolidatedData = allDates.map(date => {
            // Lấy dữ liệu của tất cả các bot trong ngày date này
            const botsDataForDate = allDailyResults
                .map(result => ({
                    botId: result.botId,
                    botName: result.botName,
                    dailyData: (result.data || []).find(d => d.date === date)
                }))
                .filter(item => item.dailyData); // Lọc bỏ những bot không có dữ liệu trong ngày này
            
            // Tính tổng từng giá trị của tất cả các bot trong 1 ngày lại vào 1 biến
            const totalAbsProfit = botsDataForDate.reduce((sum, item) => sum + (item.dailyData.abs_profit || 0), 0);
            const totalTradeCount = botsDataForDate.reduce((sum, item) => sum + (item.dailyData.trade_count || 0), 0);
            const totalFiatValue = botsDataForDate.reduce((sum, item) => sum + (item.dailyData.fiat_value || 0), 0);
            const relProfit = botsDataForDate.reduce((sum, item) => sum + (item.dailyData.rel_profit || 0), 0);
            const totalStartingBalance = botsDataForDate.reduce((sum, item) => sum + (item.dailyData.starting_balance || 0), 0)
            
            return {
                date,
                abs_profit: totalAbsProfit,
                rel_profit: relProfit,
                starting_balance: totalStartingBalance,
                fiat_value: totalFiatValue,
                trade_count: totalTradeCount,
                // Thêm thông tin chi tiết của từng bot
                bots_detail: botsDataForDate.map(item => ({
                    botId: item.botId,
                    botName: item.botName,
                    abs_profit: item.dailyData.abs_profit,
                    rel_profit: item.dailyData.rel_profit,
                    trade_count: item.dailyData.trade_count
                }))
            };
        });

        // Tạo dữ liệu tổng hợp
        const consolidatedDailyData = {
            data: consolidatedData,
            botCount: botConfigs.length
        };
        
        // Tạo cấu trúc thư mục cho dữ liệu tổng hợp
        const { timeOverDir } = createConsolidatedDirectoryStructure();
        
        // Lưu dữ liệu tổng hợp
        const filePath = path.join(timeOverDir, 'daily_combined.json');
        saveJsonToFile(filePath, consolidatedDailyData);
        
        return consolidatedDailyData;
    } catch (error) {
        console.error('Lỗi khi tổng hợp dữ liệu daily từ tất cả các bot:', error.message);
        throw error;
    }
}

/**
 * Lấy dữ liệu thống kê hàng ngày từ file local của một bot cụ thể
 * @param {string} botId - ID của bot
 * @returns {Object|null} Dữ liệu thống kê hàng ngày hoặc null nếu có lỗi
 */
function getLocalBotDailyData(botId) {
    const filePath = path.join(createBotDirectoryStructure(botId).timeOverDir, 'daily.json');
    return readJsonFromFile(filePath);
}

/**
 * Lấy dữ liệu thống kê hàng ngày tổng hợp từ file local
 * @returns {Object|null} Dữ liệu thống kê hàng ngày tổng hợp hoặc null nếu có lỗi
 */
function getLocalDailyData() {
    const filePath = path.join(createConsolidatedDirectoryStructure().timeOverDir, 'daily_combined.json');
    const data = readJsonFromFile(filePath);
    
    // Nếu không có dữ liệu tổng hợp, thử lấy từ thư mục gốc (dữ liệu cũ)
    if (!data) {
        const legacyPath = path.join(
            path.dirname(path.dirname(path.dirname(filePath))), 
            'TimeOver', 
            'daily.json'
        );
        return readJsonFromFile(legacyPath);
    }
    
    return data;
}

module.exports = {
    getBotDailyData,
    getAllDailyData,
    getLocalBotDailyData,
    getLocalDailyData
};