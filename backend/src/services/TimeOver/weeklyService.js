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
 * Lấy dữ liệu thống kê hàng tuần từ một bot cụ thể
 * @param {string} botId - ID của bot
 * @returns {Promise<Object>} Dữ liệu thống kê hàng tuần
 */
async function getBotWeeklyData(botId) {
    try {
        const token = await getAccessToken(botId);
        const botConfig = getAllBotConfigs().find(config => config.id === botId);
        
        // Gọi API để lấy dữ liệu
        const result = await axios({
            method: 'GET',
            url: `http://${botConfig.host}:${botConfig.port}/api/v1/weekly?timescale=20`,
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

        // Lưu dữ liệu vào file weekly.json cho bot cụ thể
        const filePath = path.join(timeOverDir, 'weekly.json');
        saveJsonToFile(filePath, dataWithBotId);

        return dataWithBotId;
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu weekly cho bot ${botId}:`, error.message);
        throw error;
    }
}

/**
 * Tổng hợp dữ liệu thống kê hàng tuần từ tất cả các bot
 * @returns {Promise<Object>} Dữ liệu thống kê hàng tuần tổng hợp
 */
async function getAllWeeklyData() {
    try {
        const botConfigs = getAllBotConfigs();
        const allWeeklyPromises = botConfigs.map(config => getBotWeeklyData(config.id));
        
        // Chờ tất cả các promise hoàn thành
        const allWeeklyResults = await Promise.all(allWeeklyPromises);
        
        // Lấy tất cả các tuần duy nhất từ tất cả các bot
        const allDates = Array.from(
            new Set(
                allWeeklyResults.flatMap(result => 
                    (result.data || []).map(item => item.date)
                )
            )
        ).sort();

        // Tổng hợp dữ liệu từ tất cả các bot cho mỗi tuần
        const consolidatedData = allDates.map(date => {
            // Lấy dữ liệu của tất cả các bot trong tuần này
            const botsDataForDate = allWeeklyResults
                .map(result => ({
                    botId: result.botId,
                    botName: result.botName,
                    weeklyData: (result.data || []).find(d => d.date === date)
                }))
                .filter(item => item.weeklyData); // Lọc bỏ những bot không có dữ liệu trong tuần này
            
            // Tính tổng giá trị
            const totalAbsProfit = botsDataForDate.reduce((sum, item) => sum + (item.weeklyData.abs_profit || 0), 0);
            const totalTradeCount = botsDataForDate.reduce((sum, item) => sum + (item.weeklyData.trade_count || 0), 0);
            const totalFiatValue = botsDataForDate.reduce((sum, item) => sum + (item.weeklyData.fiat_value || 0), 0);
            const relProfit = botsDataForDate.reduce((sum, item) => sum + (item.weeklyData.rel_profit || 0), 0);
            const totalStartingBalance = botsDataForDate.reduce((sum, item) => sum + (item.weeklyData.starting_balance || 0), 0)

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
                    abs_profit: item.weeklyData.abs_profit,
                    rel_profit: item.weeklyData.rel_profit,
                    trade_count: item.weeklyData.trade_count
                }))
            };
        });

        // Tạo dữ liệu tổng hợp
        const consolidatedWeeklyData = {
            data: consolidatedData,
            botCount: botConfigs.length
        };
        
        // Tạo cấu trúc thư mục cho dữ liệu tổng hợp
        const { timeOverDir } = createConsolidatedDirectoryStructure();
        
        // Lưu dữ liệu tổng hợp
        const filePath = path.join(timeOverDir, 'weekly_combined.json');
        saveJsonToFile(filePath, consolidatedWeeklyData);
        
        return consolidatedWeeklyData;
    } catch (error) {
        console.error('Lỗi khi tổng hợp dữ liệu weekly từ tất cả các bot:', error.message);
        throw error;
    }
}

/**
 * Lấy dữ liệu thống kê hàng tuần từ file local của một bot cụ thể
 * @param {string} botId - ID của bot
 * @returns {Object|null} Dữ liệu thống kê hàng tuần hoặc null nếu có lỗi
 */
function getLocalBotWeeklyData(botId) {
    const filePath = path.join(createBotDirectoryStructure(botId).timeOverDir, 'weekly.json');
    return readJsonFromFile(filePath);
}

/**
 * Lấy dữ liệu thống kê hàng tuần tổng hợp từ file local
 * @returns {Object|null} Dữ liệu thống kê hàng tuần tổng hợp hoặc null nếu có lỗi
 */
function getLocalWeeklyData() {
    const filePath = path.join(createConsolidatedDirectoryStructure().timeOverDir, 'weekly_combined.json');
    const data = readJsonFromFile(filePath);
    
    // Nếu không có dữ liệu tổng hợp, thử lấy từ thư mục gốc (dữ liệu cũ)
    if (!data) {
        const legacyPath = path.join(
            path.dirname(path.dirname(path.dirname(filePath))), 
            'TimeOver', 
            'weekly.json'
        );
        return readJsonFromFile(legacyPath);
    }
    
    return data;
}

module.exports = {
    getBotWeeklyData,
    getAllWeeklyData,
    getLocalBotWeeklyData,
    getLocalWeeklyData
};