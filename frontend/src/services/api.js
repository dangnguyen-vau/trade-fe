import axios from 'axios';

const BASE_URL = 'http://localhost:3080'; // URL của backend

/**
 * Lấy thông tin tất cả các giao dịch từ hệ thống
 * @returns {Object} Dữ liệu giao dịch bao gồm danh sách trades và số lượng
 */
export const fetchAvailableTradesData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/trades`);
    return response.data; // Trả về toàn bộ dữ liệu với cấu trúc { trades: [...], trades_count: X, ... }
  } catch (error) {
    console.error('Error fetching trades data:', error);
    return null;
  }
};

/**
 * Lấy thông tin số dư tài khoản của các bot
 * @returns {Object} Dữ liệu về số dư và lịch sử số dư
 */
export const fetchBalanceData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/balance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching balance data:', error);
    return null;
  }
};

/**
 * Lấy danh sách tất cả các bot và thông tin của chúng
 * @returns {Array} Mảng chứa thông tin của tất cả các bot
 */
export const fetchAllBotsData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bots`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bots data:', error);
    return null;
  }
};

/**
 * Lấy dữ liệu chi tiết của một bot theo tên file cấu hình
 * @param {string} filename Tên file cấu hình của bot
 * @returns {Object} Thông tin chi tiết của bot
 */
export const getBotData = async (filename) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bots/file/${filename}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bot data for ${filename}:`, error);
    return null;
  }
};

/**
 * Lấy thống kê theo ngày của các bot
 * @param {Date} date Ngày cần lấy thống kê
 * @returns {Array} Mảng chứa thống kê theo ngày của các bot
 */
export const fetchDailyStats = async (date) => {
  try {
    if (!date) {
      console.error('Ngày không hợp lệ trong fetchDailyStats:', date);
      return null;
    }

    // Đảm bảo date là đối tượng Date hợp lệ
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Đối tượng Date không hợp lệ trong fetchDailyStats:', date);
      return null;
    }

    // Sử dụng luôn API endpoint '/api/stats/daily/:date'
    const url = `${BASE_URL}/api/stats/daily/${date.toISOString().split('T')[0]}`;
    const response = await axios.get(url);

    // Thêm trường id = name cho mỗi bot để đảm bảo hiển thị đúng trong BotCard
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(bot => ({
        ...bot,
        id: bot.name // Thêm trường id giống tên để đảm bảo hiển thị đúng trong BotCard
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return null;
  }
};

/**
 * Lấy thống kê theo tuần của các bot
 * @param {Date} endDate Ngày kết thúc của tuần cần lấy thống kê
 * @returns {Array} Mảng chứa thống kê theo tuần của các bot
 */
export const fetchWeeklyStats = async (endDate) => {
  try {
    let url = `${BASE_URL}/api/stats/weekly`;
    if (endDate) {
      // Nếu có tham số endDate, sử dụng param trong URL
      url = `${BASE_URL}/api/stats/weekly/${endDate.toISOString().split('T')[0]}`;
      const response = await axios.get(url);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return null;
  }
};

/**
 * Lấy thống kê theo tháng của các bot
 * @param {Date} date Ngày trong tháng cần lấy thống kê
 * @returns {Array} Mảng chứa thống kê theo tháng của các bot
 */
export const fetchMonthlyStats = async (date) => {
  try {
    let url = `${BASE_URL}/api/stats/monthly`;
    if (date) {
      // Kiểm tra date có hợp lệ không trước khi gọi toISOString()
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error('Invalid date provided to fetchMonthlyStats:', date);
        return null;
      }
      // Nếu có tham số date, sử dụng param trong URL
      url = `${BASE_URL}/api/stats/monthly/${date.toISOString().split('T')[0]}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return null;
  }
};

/**
 * Lấy thông tin metadata của hệ thống (ngày giao dịch mới nhất, phiên bản...)
 * @returns {Object} Thông tin metadata của hệ thống
 */
export const fetchMetadata = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/metadata`);
    return response.data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};

/**
 * Lấy thống kê tổng hợp từ tất cả các bot (tỷ lệ thắng, tổng lợi nhuận...)
 * @returns {Object} Thống kê tổng hợp của tất cả các bot
 */
export const fetchAggregatedStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/stats/aggregated`);
    return response.data;
  } catch (error) {
    console.error('Error fetching aggregated stats:', error);
    return {
      totalTrades: 0,
      winningTrades: 0,
      winRate: 0,
      totalProfit: 0,
      averageProfit: 0,
      maxDrawdown: 0
    };
  }
};

/**
 * Lấy danh sách các tuần có dữ liệu thống kê
 * @returns {Array} Danh sách các tuần có dữ liệu
 */
export const fetchAvailableWeeks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/stats/available-weeks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available weeks:', error);
    return [];
  }
};

/**
 * Lấy danh sách các tháng có dữ liệu thống kê
 * @returns {Array} Danh sách các tháng có dữ liệu
 */
export const fetchAvailableMonths = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/stats/available-months`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available months:', error);
    return [];
  }
};
