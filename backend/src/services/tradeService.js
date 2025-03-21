const { getAccessToken, getAllBotConfigs } = require('../services');
const axios = require('axios');
const path = require('path');
const { 
  createBotDirectoryStructure, 
  createConsolidatedDirectoryStructure, 
  saveJsonToFile, 
  readJsonFromFile 
} = require('../utils/fileUtils');

/**
 * Lấy dữ liệu giao dịch từ một bot cụ thể
 * @param {string} botId - ID của bot
 * @returns {Promise<Object>} Dữ liệu giao dịch của bot
 */
async function getBotTradeData(botId) {
    try {
        const token = await getAccessToken(botId);
        const botConfig = getAllBotConfigs().find(config => config.id === botId);
        
        // Gọi API và lấy dữ liệu giao dịch
        const result = await axios({
            method: 'GET',
            url: `http://${botConfig.host}:${botConfig.port}/api/v1/trades`,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        // Tạo cấu trúc thư mục cho bot
        const { botDir } = createBotDirectoryStructure(botId);
        
        // Thêm trường botId vào mỗi giao dịch để dễ phân biệt
        const tradesWithBotId = {
            ...result.data,
            trades: result.data.trades.map(trade => ({
                ...trade,
                botId: botId
            }))
        };

        // Lưu dữ liệu vào file trades.json cho bot cụ thể
        const filePath = path.join(botDir, 'trades.json');
        saveJsonToFile(filePath, tradesWithBotId);

        return tradesWithBotId;
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu trades cho bot ${botId}:`, error.message);
        throw error;
    }
}

/**
 * Tổng hợp dữ liệu giao dịch từ tất cả các bot
 * @returns {Promise<Object>} Dữ liệu giao dịch tổng hợp
 */
async function getAllTradesData() {
    try {
        const botConfigs = getAllBotConfigs();
        const allTradesPromises = botConfigs.map(config => getBotTradeData(config.id));
        
        // Chờ tất cả các promise hoàn thành
        const allTradesResults = await Promise.all(allTradesPromises);
        
        // Tổng hợp tất cả các giao dịch vào một danh sách
        const consolidatedTrades = {
            trades: allTradesResults.flatMap(result => result.trades || []),
            trade_count: allTradesResults.reduce((sum, result) => sum + (result.trades_count || 0), 0)
        };
        
        // Tạo cấu trúc thư mục cho dữ liệu tổng hợp
        const { consolidatedDir } = createConsolidatedDirectoryStructure();
        
        // Lưu dữ liệu tổng hợp
        const filePath = path.join(consolidatedDir, 'all_trades.json');
        saveJsonToFile(filePath, consolidatedTrades);
        
        return consolidatedTrades;
    } catch (error) {
        console.error('Lỗi khi tổng hợp dữ liệu trades từ tất cả các bot:', error.message);
        throw error;
    }
}

/**
 * Lấy dữ liệu giao dịch từ file local của một bot cụ thể
 * @param {string} botId - ID của bot
 * @returns {Object|null} Dữ liệu giao dịch của bot hoặc null nếu có lỗi
 */
function getLocalBotTradesData(botId) {
    const filePath = path.join(createBotDirectoryStructure(botId).botDir, 'trades.json');
    return readJsonFromFile(filePath);
}

/**
 * Lấy dữ liệu giao dịch tổng hợp của tất cả các bot từ file local
 * @returns {Object|null} Dữ liệu giao dịch tổng hợp hoặc null nếu có lỗi
 */
function getLocalTradesData() {
    const filePath = path.join(createConsolidatedDirectoryStructure().consolidatedDir, 'all_trades.json');
    const data = readJsonFromFile(filePath);
    
    // Nếu không có dữ liệu tổng hợp, thử lấy từ thư mục gốc (dữ liệu cũ)
    if (!data) {
        const legacyPath = path.join(path.dirname(path.dirname(filePath)), 'trades.json');
        return readJsonFromFile(legacyPath);
    }
    
    return data;
}

module.exports = {
    getBotTradeData,
    getAllTradesData,
    getLocalBotTradesData,
    getLocalTradesData
};