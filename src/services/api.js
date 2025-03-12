import axios from 'axios';

const API_BASE_URL = 'http://localhost:3003/api';

export const getBotDataList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bot data list:', error);
    throw error;
  }
};

export const getBotData = async (filename) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/data/${filename}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bot data for ${filename}:`, error);
    throw error;
  }
};
