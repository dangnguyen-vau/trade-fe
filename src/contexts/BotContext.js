import React, { createContext, useState, useContext, useEffect } from 'react';
import { botsData } from '../mocks/botsData';

// Tạo context
const BotContext = createContext();

// Provider component
export const BotProvider = ({ children }) => {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date('2025-02-09')); // Ngày mặc định
  
  // Tải dữ liệu bots
  useEffect(() => {
    // Trong một ứng dụng thực tế, bạn sẽ fetch dữ liệu từ API
    // Nhưng ở đây chúng ta sử dụng dữ liệu mẫu
    setBots(botsData);
    setLoading(false);
  }, []);
  
  // Thay đổi ngày
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };
  
  // Giá trị được cung cấp bởi context
  const value = {
    bots,
    loading,
    selectedDate,
    changeDate
  };
  
  return (
    <BotContext.Provider value={value}>
      {children}
    </BotContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useBotContext = () => {
  const context = useContext(BotContext);
  if (context === undefined) {
    throw new Error('useBotContext must be used within a BotProvider');
  }
  return context;
};
