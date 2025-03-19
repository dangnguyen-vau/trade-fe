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