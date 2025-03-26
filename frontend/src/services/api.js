import axios from 'axios';

const BASE_URL = 'http://localhost:3080'; // URL của backend

export const fetchTradesData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/trades`);
    return response.data; // Trả về toàn bộ dữ liệu với cấu trúc { trades: [...], trades_count: X, ... }
  } catch (error) {
    console.error('Error fetching trades data:', error);
    return null;
  }
};

export const fetchBalanceData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/balance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching balance data:', error);
    return null;
  }
};

export const fetchProfitData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/profit`);
    return response.data;
  } catch (error) {
    console.error('Error fetching profit data:', error);
    return null;
  }
};

export const fetchDailyData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/daily`);
    return response.data; // Trả về toàn bộ dữ liệu daily
  } catch (error) {
    console.error('Error fetching daily data:', error);
    return null;
  }
};

export const fetchWeeklyData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/week`);
    return response.data; // Trả về toàn bộ dữ liệu weekly
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    return null;
  }
};

export const fetchMonthlyData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/month`);
    return response.data; // Trả về toàn bộ dữ liệu monthly
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    return null;
  }
};

export const fetchBotsData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bots`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bots data:', error);
    return null;
  }
};

export const fetchDailyStats = async (date) => {
  try {
    let url = `${BASE_URL}/api/stats/daily`;
    if (date) {
      // Nếu có tham số date, sử dụng param trong URL
      url = `${BASE_URL}/api/stats/daily/${date.toISOString().split('T')[0]}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return null;
  }
};

export const fetchWeeklyStats = async (endDate) => {
  try {
    let url = `${BASE_URL}/api/stats/weekly`;
    if (endDate) {
      // Nếu có tham số endDate, sử dụng param trong URL
      url = `${BASE_URL}/api/stats/weekly/${endDate.toISOString().split('T')[0]}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return null;
  }
};

export const fetchMonthlyStats = async (date) => {
  try {
    let url = `${BASE_URL}/api/stats/monthly`;
    if (date) {
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

export const fetchMetadata = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/metadata`);
    return response.data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};

export const fetchBotDetails = async (botName) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bots/${botName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for bot ${botName}:`, error);
    return null;
  }
};

/**
 * Lấy dữ liệu thống kê tổng hợp đã được xử lý từ backend
 * @returns {Promise<Object>} Thống kê tổng hợp
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
