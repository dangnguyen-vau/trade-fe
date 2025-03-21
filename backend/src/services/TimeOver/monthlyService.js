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
 * Lấy dữ liệu thống kê hàng tháng từ một bot cụ thể
 * @param {string} botId - ID của bot
 * @returns {Promise<Object>} Dữ liệu thống kê hàng tháng
 */
async function getBotMonthlyData(botId) {
    try {
        const token = await getAccessToken(botId);
        const botConfig = getAllBotConfigs().find(config => config.id === botId);
        
        // Gọi API để lấy dữ liệu
        const result = await axios({
            method: 'GET',
            url: `http://${botConfig.host}:${botConfig.port}/api/v1/monthly?timescale=20`,
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

        // Lưu dữ liệu vào file monthly.json cho bot cụ thể
        const filePath = path.join(timeOverDir, 'monthly.json');
        saveJsonToFile(filePath, dataWithBotId);

        return dataWithBotId;
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu monthly cho bot ${botId}:`, error.message);
        throw error;
    }
}

/**
 * Tổng hợp dữ liệu thống kê hàng tháng từ tất cả các bot
 * @returns {Promise<Object>} Dữ liệu thống kê hàng tháng tổng hợp
 */
async function getAllMonthlyData() {
    try {
        const botConfigs = getAllBotConfigs();
        const allMonthlyPromises = botConfigs.map(config => getBotMonthlyData(config.id));
        
        // Chờ tất cả các promise hoàn thành
        const allMonthlyResults = await Promise.all(allMonthlyPromises);
        
        // Lấy tất cả các tháng duy nhất từ tất cả các bot
        const allDates = Array.from(
            new Set(
                allMonthlyResults.flatMap(result => 
                    (result.data || []).map(item => item.date)
                )
            )
        ).sort();

        // Tổng hợp dữ liệu từ tất cả các bot cho mỗi tháng
        const consolidatedData = allDates.map(date => {
            // Lấy dữ liệu của tất cả các bot trong tháng này
            const botsDataForDate = allMonthlyResults
                .map(result => ({
                    botId: result.botId,
                    botName: result.botName,
                    monthlyData: (result.data || []).find(d => d.date === date)
                }))
                .filter(item => item.monthlyData); // Lọc bỏ những bot không có dữ liệu trong tháng này
            
            // Tính tổng giá trị
            const totalAbsProfit = botsDataForDate.reduce((sum, item) => sum + (item.monthlyData.abs_profit || 0), 0);
            const totalTradeCount = botsDataForDate.reduce((sum, item) => sum + (item.monthlyData.trade_count || 0), 0);
            const totalFiatValue = botsDataForDate.reduce((sum, item) => sum + (item.monthlyData.fiat_value || 0), 0);
            
            // Tính tổng số dư ban đầu
            const totalStartingBalance = botsDataForDate.reduce((sum, item) => sum + (item.monthlyData.starting_balance || 0), 0);
            
            // Tính tỷ lệ lợi nhuận dựa trên số dư ban đầu
            const relProfit = totalStartingBalance > 0 
                ? (totalAbsProfit / totalStartingBalance) 
                : 0;
            
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
                    abs_profit: item.monthlyData.abs_profit,
                    rel_profit: item.monthlyData.rel_profit,
                    trade_count: item.monthlyData.trade_count
                }))
            };
        });

        // Tạo dữ liệu tổng hợp
        const consolidatedMonthlyData = {
            data: consolidatedData,
            botCount: botConfigs.length
        };
        
        // Tạo cấu trúc thư mục cho dữ liệu tổng hợp
        const { timeOverDir } = createConsolidatedDirectoryStructure();
        
        // Lưu dữ liệu tổng hợp
        const filePath = path.join(timeOverDir, 'monthly_combined.json');
        saveJsonToFile(filePath, consolidatedMonthlyData);
        
        return consolidatedMonthlyData;
    } catch (error) {
        console.error('Lỗi khi tổng hợp dữ liệu monthly từ tất cả các bot:', error.message);
        throw error;
    }
}

/**
 * Lấy dữ liệu thống kê hàng tháng từ file local của một bot cụ thể
 * @param {string} botId - ID của bot
 * @returns {Object|null} Dữ liệu thống kê hàng tháng hoặc null nếu có lỗi
 */
function getLocalBotMonthlyData(botId) {
    const filePath = path.join(createBotDirectoryStructure(botId).timeOverDir, 'monthly.json');
    return readJsonFromFile(filePath);
}

/**
 * Lấy dữ liệu thống kê hàng tháng tổng hợp từ file local
 * @returns {Object|null} Dữ liệu thống kê hàng tháng tổng hợp hoặc null nếu có lỗi
 */
function getLocalMonthlyData() {
    const filePath = path.join(createConsolidatedDirectoryStructure().timeOverDir, 'monthly_combined.json');
    const data = readJsonFromFile(filePath);
    
    // Nếu không có dữ liệu tổng hợp, thử lấy từ thư mục gốc (dữ liệu cũ)
    if (!data) {
        const legacyPath = path.join(
            path.dirname(path.dirname(path.dirname(filePath))), 
            'TimeOver', 
            'monthly.json'
        );
        return readJsonFromFile(legacyPath);
    }
    
    return data;
}

module.exports = {
    getBotMonthlyData,
    getAllMonthlyData,
    getLocalBotMonthlyData,
    getLocalMonthlyData
};