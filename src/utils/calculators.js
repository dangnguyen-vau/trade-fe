// Tính toán tổng lợi nhuận
export const calculateTotalProfit = (data = []) => {
  return data.reduce((sum, item) => sum + (item.profit || 0), 0);
};

// Tính toán hiệu suất trung bình
export const calculateAveragePerformance = (data = []) => {
  if (data.length === 0) return 0;
  const totalPerformance = data.reduce((sum, item) => sum + (item.performance || 0), 0);
  return totalPerformance / data.length;
};

// Tính toán ROI (Return on Investment)
export const calculateROI = (initialInvestment, currentValue) => {
  if (!initialInvestment || initialInvestment === 0) return 0;
  return ((currentValue - initialInvestment) / initialInvestment) * 100;
};
