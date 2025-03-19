const app = require('./app');
const { getBalanceData } = require('./src/services/balanceService');
const { getProfitData } = require('./src/services/profitService');
const { getDailyData } = require('./src/services/TimeOver/dailyService');
const { getMonthlyData } = require('./src/services/TimeOver/monthlyService');
const { getWeeklyData } = require('./src/services/TimeOver/weeklyService');
const { getTradesData } = require('./src/services/tradeService');


const PORT = process.env.PORT || 3080;

// Khởi động server
app.listen(PORT, async () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  
  // Lấy dữ liệu ban đầu khi khởi động server
  try {
    await getTradesData();
    await getProfitData();
    await getBalanceData();
    await getDailyData();
    await getMonthlyData();
    await getWeeklyData();

    console.log('Đã lấy và lưu dữ liệu ban đầu');
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu ban đầu:', error.message);
  }
});