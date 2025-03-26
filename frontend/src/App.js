import React, { useState, useMemo, useCallback, useEffect } from 'react';
import './App.css';
import TopBar from './components/layout/TopBar';
import ProfitChart from './components/ui/ProfitChart';
import BotCard from './components/bot/BotCard';
import DailyStatsSummary from './components/stats/DailyStatsSummary';
import WeeklyStatsSummary from './components/stats/WeeklyStatsSummary';
import QuickOverview from './components/layout/QuickOverview';
import BotDetail from './components/bot/BotDetail';
import AllTradesDetail from './components/trades/AllTradesDetail';
import Modal from './components/ui/Modal';
import MultiStrategyBacktestResults from './components/strategy/MultiStrategyBacktestResults';
import {
  fetchTradesData,
  fetchBotsData,
  fetchMetadata,
  fetchDailyStats,
  fetchWeeklyStats,
  fetchMonthlyStats
} from './services/api';

// Custom hook để quản lý state và API
const useDataFetching = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [botsData, setBotsData] = useState([]);
  const [tradesData, setTradesData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateStats, setSelectedDateStats] = useState([]);
  const [previousDateStats, setPreviousDateStats] = useState([]);
  const [weeklyBotsData, setWeeklyBotsData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyBotsData, setMonthlyBotsData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [fourWeekData, setFourWeekData] = useState([]);
  const [twelveMonthData, setTwelveMonthData] = useState([]);

  // Tính toán ngày hôm qua
  const yesterdayDate = useMemo(() => {
    const date = new Date(selectedDate);
    date.setDate(selectedDate.getDate() - 1);
    return date;
  }, [selectedDate]);

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Sử dụng Promise.all để gọi nhiều API cùng lúc
        const [botsDataFetch, trades, metadata] = await Promise.all([
          fetchBotsData(),
          fetchTradesData(),
          fetchMetadata()
        ]);
        
        setTradesData(trades);
        
        if (botsDataFetch) {
          setBotsData(botsDataFetch);
          
          if (metadata && metadata.latest_trade_date) {
            setSelectedDate(new Date(metadata.latest_trade_date));
          }
        } else {
          setError('Không thể tải dữ liệu bot. Vui lòng thử lại sau.');
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch dữ liệu thống kê ngày đã chọn
  useEffect(() => {
    const fetchSelectedDateStatsData = async () => {
      try {
        const data = await fetchDailyStats(selectedDate);
        setSelectedDateStats(data || []);
      } catch (error) {
        console.error('Error fetching selected date stats:', error);
        setSelectedDateStats([]);
      }
    };

    fetchSelectedDateStatsData();
  }, [selectedDate]);

  // Fetch dữ liệu ngày hôm trước
  useEffect(() => {
    const fetchPrevDateStatsData = async () => {
      try {
        const data = await fetchDailyStats(yesterdayDate);
        setPreviousDateStats(data || []);
      } catch (error) {
        console.error('Error fetching previous date stats:', error);
        setPreviousDateStats([]);
      }
    };

    fetchPrevDateStatsData();
  }, [yesterdayDate]);

  // Fetch dữ liệu thống kê tuần
  useEffect(() => {
    const fetchWeeklyStatsData = async () => {
      try {
        const data = await fetchWeeklyStats(selectedDate);
        setWeeklyBotsData(data || []);
      } catch (error) {
        console.error('Error fetching weekly stats:', error);
        setWeeklyBotsData([]);
      }
    };

    fetchWeeklyStatsData();
  }, [selectedDate]);

  // Fetch dữ liệu thống kê tháng
  useEffect(() => {
    const fetchMonthlyStatsData = async () => {
      try {
        const data = await fetchMonthlyStats(selectedDate);
        setMonthlyBotsData(data || []);
      } catch (error) {
        console.error('Error fetching monthly stats:', error);
        setMonthlyBotsData([]);
      }
    };

    fetchMonthlyStatsData();
  }, [selectedDate]);

  // Fetch dữ liệu weekly data (7 ngày)
  useEffect(() => {
    const fetchWeeklyDataForChart = async () => {
      try {
        const result = [];
        const promises = [];
        
        // Tạo mảng chứa 7 ngày gần nhất để lấy dữ liệu
        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(selectedDate);
          currentDate.setDate(selectedDate.getDate() - i);
          
          // Tạo promise để fetch dữ liệu
          promises.push(
            fetchDailyStats(currentDate)
              .then(dailyStatsForDay => {
                return {
                  date: currentDate.toISOString().split('T')[0],
                  bots: dailyStatsForDay ? dailyStatsForDay.map(bot => ({
                    id: bot.name,
                    ...bot
                  })) : []
                };
              })
              .catch(error => {
                console.error(`Error fetching daily stats for day ${i}:`, error);
                return {
                  date: currentDate.toISOString().split('T')[0],
                  bots: []
                };
              })
          );
        }
        
        // Chờ tất cả các promise hoàn thành
        const dailyResults = await Promise.all(promises);
        
        // Sắp xếp kết quả theo ngày
        dailyResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setWeeklyData(dailyResults);
      } catch (error) {
        console.error('Error fetching weekly data for chart:', error);
        setWeeklyData([]);
      }
    };

    fetchWeeklyDataForChart();
  }, [selectedDate]);

  // Fetch dữ liệu four week data (4 tuần)
  useEffect(() => {
    const fetchFourWeekData = async () => {
      try {
        const promises = [];
        
        for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
          const endDate = new Date(selectedDate);
          endDate.setDate(selectedDate.getDate() - (weekIndex * 7));
          const startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 6);
          
          promises.push(
            fetchWeeklyStats(endDate)
              .then(botPerformances => {
                // Tính tổng lợi nhuận cho tuần
                const totalProfit = botPerformances && Array.isArray(botPerformances)
                  ? botPerformances.reduce((sum, bot) => sum + (bot.performance || 0), 0)
                  : 0;
                
                return {
                  weekStart: startDate.toISOString().split('T')[0],
                  weekEnd: endDate.toISOString().split('T')[0],
                  totalProfit: parseFloat(totalProfit.toFixed(1)),
                  weekIndex,
                  botPerformances: botPerformances || []
                };
              })
              .catch(error => {
                console.error(`Error fetching weekly stats for week ${weekIndex}:`, error);
                return {
                  weekStart: startDate.toISOString().split('T')[0],
                  weekEnd: endDate.toISOString().split('T')[0],
                  totalProfit: 0,
                  weekIndex,
                  botPerformances: []
                };
              })
          );
        }
        
        const result = await Promise.all(promises);
        setFourWeekData(result);
      } catch (error) {
        console.error('Error fetching four week data:', error);
        setFourWeekData([]);
      }
    };

    fetchFourWeekData();
  }, [selectedDate]);

  // Fetch dữ liệu monthly data (30 ngày)
  useEffect(() => {
    const fetchMonthlyDataForChart = async () => {
      try {
        const promises = [];
        
        for (let i = 0; i < 30; i++) {
          const currentDate = new Date(selectedDate);
          currentDate.setDate(selectedDate.getDate() - i);
          
          promises.push(
            fetchDailyStats(currentDate)
              .then(dailyStatsForDay => {
                return {
                  date: currentDate.toISOString().split('T')[0],
                  bots: dailyStatsForDay ? dailyStatsForDay.map(bot => ({
                    name: bot.name,
                    performance: bot.performance || 0,
                    net_profit: bot.net_profit || 0,
                    balance: bot.balance || 0,
                    winrate: parseInt(bot.winRate) || 0
                  })) : []
                };
              })
              .catch(error => {
                console.error(`Error fetching daily stats for day ${i} in monthly:`, error);
                return {
                  date: currentDate.toISOString().split('T')[0],
                  bots: []
                };
              })
          );
        }
        
        const result = await Promise.all(promises);
        // Sắp xếp kết quả theo ngày
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setMonthlyData(result);
      } catch (error) {
        console.error('Error fetching monthly data for chart:', error);
        setMonthlyData([]);
      }
    };

    fetchMonthlyDataForChart();
  }, [selectedDate]);

  // Fetch dữ liệu twelve month data (12 tháng)
  useEffect(() => {
    const fetchTwelveMonthData = async () => {
      try {
        const promises = [];
        
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
          const endDate = new Date(selectedDate);
          endDate.setMonth(selectedDate.getMonth() - monthIndex);
          const startDate = new Date(endDate);
          startDate.setDate(1); // First day of month
          
          promises.push(
            fetchMonthlyStats(endDate)
              .then(botPerformances => {
                // Tính tổng lợi nhuận cho tháng
                const totalProfit = botPerformances && Array.isArray(botPerformances)
                  ? botPerformances.reduce((sum, bot) => sum + (bot.performance || 0), 0)
                  : 0;
                
                return {
                  monthStart: startDate.toISOString().split('T')[0],
                  monthEnd: endDate.toISOString().split('T')[0],
                  totalProfit: parseFloat(totalProfit.toFixed(1)),
                  monthIndex,
                  monthLabel: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                  botPerformances: botPerformances || []
                };
              })
              .catch(error => {
                console.error(`Error fetching monthly stats for month ${monthIndex}:`, error);
                return {
                  monthStart: startDate.toISOString().split('T')[0],
                  monthEnd: endDate.toISOString().split('T')[0],
                  totalProfit: 0,
                  monthIndex,
                  monthLabel: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                  botPerformances: []
                };
              })
          );
        }
        
        const result = await Promise.all(promises);
        setTwelveMonthData(result);
      } catch (error) {
        console.error('Error fetching twelve month data:', error);
        setTwelveMonthData([]);
      }
    };

    fetchTwelveMonthData();
  }, [selectedDate]);

  // Handle date navigation
  const changeDate = useCallback((days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  }, [selectedDate]);

  return {
    loading,
    error,
    botsData,
    tradesData,
    selectedDate,
    setSelectedDate,
    selectedDateStats,
    previousDateStats,
    weeklyBotsData,
    weeklyData,
    monthlyBotsData,
    monthlyData,
    fourWeekData,
    twelveMonthData,
    changeDate
  };
};

// Custom hook để tính toán các chỉ số thống kê
const useStatsCalculation = (selectedDateStats, previousDateStats, weeklyBotsData) => {
  // Calculate metrics for selected date
  const selectedNetProfit = useMemo(() =>
    selectedDateStats.reduce((sum, bot) => sum + (bot.performance || 0), 0).toFixed(1)
  , [selectedDateStats]);

  const previousNetProfit = useMemo(() =>
    previousDateStats.reduce((sum, bot) => sum + (bot.performance || 0), 0).toFixed(1)
  , [previousDateStats]);

  const netProfitChange = useMemo(() =>
    (Number(selectedNetProfit) - Number(previousNetProfit)).toFixed(1)
  , [selectedNetProfit, previousNetProfit]);

  // Calculate today's net profit amount
  const todayNetProfitAmount = useMemo(() =>
    selectedDateStats.reduce((sum, bot) => sum + (bot.net_profit || 0), 0)
  , [selectedDateStats]);

  // Find top and bottom performers
  const { topBot, bottomBot } = useMemo(() => {
    let maxPerf = -Infinity;
    let minPerf = Infinity;
    let topBot = null;
    let bottomBot = null;

    selectedDateStats.forEach(bot => {
      if (bot.performance > maxPerf) {
        maxPerf = bot.performance;
        topBot = {
          name: bot.name,
          performance: bot.performance
        };
      }
      if (bot.performance < minPerf) {
        minPerf = bot.performance;
        bottomBot = {
          name: bot.name,
          performance: bot.performance
        };
      }
    });

    return { topBot, bottomBot };
  }, [selectedDateStats]);

  // Calculate profitable bots
  const profitableBotsToday = useMemo(() =>
    selectedDateStats.filter(bot => (bot.performance || 0) > 0).length
  , [selectedDateStats]);

  const profitableBotsYesterday = useMemo(() =>
    previousDateStats.filter(bot => (bot.performance || 0) > 0).length
  , [previousDateStats]);

  const profitableBotsChange = useMemo(() =>
    profitableBotsToday - profitableBotsYesterday
  , [profitableBotsToday, profitableBotsYesterday]);

  const totalBots = useMemo(() => selectedDateStats.length, [selectedDateStats]);

  // Prepare daily data
  const latestBotsData = useMemo(() =>
    selectedDateStats.map(bot => ({
      id: bot.name,
      ...bot
    }))
  , [selectedDateStats]);

  // Calculate weekly metrics
  const weeklyNetProfit = useMemo(() =>
    weeklyBotsData.reduce((sum, bot) => sum + (bot.net_profit || 0), 0)
  , [weeklyBotsData]);

  const topWeeklyPerformer = useMemo(() =>
    weeklyBotsData.reduce((best, current) =>
      (current.performance || 0) > (best.performance || 0) ? current : best,
      { performance: -Infinity }
    )
  , [weeklyBotsData]);

  const bottomWeeklyPerformer = useMemo(() =>
    weeklyBotsData.reduce((worst, current) =>
      (current.performance || 0) < (worst.performance || 0) ? current : worst,
      { performance: Infinity }
    )
  , [weeklyBotsData]);

  const avgProfitableBotsPerDay = useMemo(() =>
    weeklyBotsData.filter(bot => (bot.performance || 0) > 0).length
  , [weeklyBotsData]);

  // Calculate weekly total profit percent
  const weeklyTotalProfitPercent = useMemo(() =>
    weeklyBotsData.reduce((sum, bot) => sum + (bot.performance || 0), 0).toFixed(2)
  , [weeklyBotsData]);

  return {
    selectedNetProfit,
    netProfitChange,
    todayNetProfitAmount,
    topBot,
    bottomBot,
    profitableBotsToday,
    totalBots,
    profitableBotsChange,
    latestBotsData,
    weeklyNetProfit,
    topWeeklyPerformer,
    bottomWeeklyPerformer,
    avgProfitableBotsPerDay,
    weeklyTotalProfitPercent
  };
};

function App() {
  const [hoveredBot, setHoveredBot] = useState(null);
  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [selectedWeekData, setSelectedWeekData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllTradesModalOpen, setIsAllTradesModalOpen] = useState(false);

  const {
    loading,
    error,
    botsData,
    tradesData,
    selectedDate,
    setSelectedDate,
    selectedDateStats,
    previousDateStats,
    weeklyBotsData,
    weeklyData,
    monthlyBotsData,
    monthlyData,
    fourWeekData,
    twelveMonthData,
    changeDate
  } = useDataFetching();

  const {
    selectedNetProfit,
    netProfitChange,
    todayNetProfitAmount,
    topBot,
    bottomBot,
    profitableBotsToday,
    totalBots,
    profitableBotsChange,
    latestBotsData,
    weeklyNetProfit,
    topWeeklyPerformer,
    bottomWeeklyPerformer,
    avgProfitableBotsPerDay,
    weeklyTotalProfitPercent
  } = useStatsCalculation(selectedDateStats, previousDateStats, weeklyBotsData);

  // Xử lý khi click vào bot
  const handleBotClick = useCallback((bot) => {
    setSelectedBot(bot.name);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Đặt timeout để tránh hiệu ứng nhấp nháy khi đóng modal
    setTimeout(() => setSelectedBot(null), 300);
  }, []);

  // Mở modal xem tất cả lệnh
  const handleOpenAllTradesModal = useCallback(() => {
    setIsAllTradesModalOpen(true);
  }, []);

  // Đóng modal xem tất cả lệnh
  const handleCloseAllTradesModal = useCallback(() => {
    setIsAllTradesModalOpen(false);
  }, []);

  // Hiển thị loading khi đang tải dữ liệu
  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return <div className="error">{error}</div>;
  }

  // Kiểm tra nếu không có dữ liệu
  if (botsData.length === 0) {
    return <div className="no-data">Không có dữ liệu để hiển thị.</div>;
  }

  // Tìm thông tin chi tiết của bot được chọn
  const selectedBotData = selectedBot ? botsData.find(bot => bot.name === selectedBot) : null;

  return (
    <div className="App">
      <TopBar />
      <div className="content">
        <div className="main-boxes">
          <div className="dashboard-header">
            <h1>Bot Profit Monitor</h1>
            <p>Track • Analyze • Optimize</p>
          </div>

          <div className="dashboard-section">
            <div className="header-section">
              <h1>Daily Trading Summary</h1>
              <div className="subtitle-with-controls">
                <div className="subtitle">
                  Profit Overview •
                  <div className="date-controls">
                    <button
                      className="date-nav-btn"
                      onClick={() => changeDate(-1)}
                      title="Previous day"
                    >
                      ←
                    </button>
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="date-picker"
                    />
                    <button
                      className="date-nav-btn"
                      onClick={() => changeDate(1)}
                      title="Next day"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
              <div className="stats-container">
                {/* Tổng kết của ngày */}
                <DailyStatsSummary
                  todayNetProfit={selectedNetProfit}
                  todayNetProfitChange={netProfitChange}
                  todayNetProfitAmount={todayNetProfitAmount}
                  topPerformer={topBot?.name}
                  topPerformanceValue={topBot?.performance?.toFixed(2)}
                  bottomPerformer={bottomBot?.name}
                  bottomPerformanceValue={bottomBot?.performance?.toFixed(2)}
                  profitableBots={profitableBotsToday}
                  totalBots={totalBots}
                  profitableBotsChange={profitableBotsChange}
                />

              </div>
            </div>
            <div className="dashboard-container">
              {/* Sơ đồ cột */}
              <div className="chart-section">
                <ProfitChart
                  botsData={latestBotsData} // Giá trị không dùng đến
                  onBotHover={setHoveredBot}
                  type="daily"
                  weeklyData={weeklyData}
                  selectedDayData={selectedDayData}
                  setSelectedDayData={setSelectedDayData}
                />
              </div>
              {/* List Card Bot */}
              <div className="bots-list">
                {(selectedDayData ? selectedDayData.bots : latestBotsData).map((bot, index) => (
                  <BotCard
                    key={bot.id}
                    bot={bot}
                    index={index}
                    isHighlighted={hoveredBot === bot.name}
                    isSelected={selectedBot === bot.name}
                    onClick={() => handleBotClick(bot)}
                    type="daily"
                    selectedDate={selectedDate.toISOString().split('T')[0]}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="dashboard-section">
            <div className="header-section">
              <div>
                <h1>Weekly Profit Analysis</h1>
                <div className="subtitle-with-controls">
                  <div className="subtitle">
                    Profit Overview  •
                    <div className="date-controls">
                      <button
                        className="date-nav-btn"
                        onClick={() => changeDate(-7)}
                        title="Previous week"
                      >
                        ←
                      </button>
                      <span>
                        {weeklyData.length > 6 && new Date(weeklyData[6].date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })} - {weeklyData.length > 0 && new Date(weeklyData[0].date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <button
                        className="date-nav-btn"
                        onClick={() => changeDate(7)}
                        title="Next week"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <WeeklyStatsSummary
                weeklyNetProfit={weeklyNetProfit}
                totalProfitPercent={weeklyTotalProfitPercent}
                topPerformer={topWeeklyPerformer.name}
                topPerformanceValue={topWeeklyPerformer.performance}
                bottomPerformer={bottomWeeklyPerformer.name}
                bottomPerformanceValue={bottomWeeklyPerformer.performance}
                profitableBots={avgProfitableBotsPerDay}
                totalBots={botsData.length}
              />
            </div>
            <div className="dashboard-container">
              <div className="chart-section">
                <ProfitChart
                  botsData={weeklyBotsData}
                  onBotHover={setHoveredBot}
                  type="weekly"
                  fourWeekData={fourWeekData}
                  weeklyData={weeklyData}
                  selectedWeekData={selectedWeekData}
                  setSelectedWeekData={setSelectedWeekData}
                />
              </div>
              <div className="bots-list">
                {(selectedWeekData ? selectedWeekData.botPerformances : weeklyBotsData).map((bot, index) => (
                  <BotCard
                    key={bot.id || index}
                    bot={bot}
                    index={index}
                    isHighlighted={hoveredBot === bot.name}
                    isSelected={selectedBot === bot.name}
                    onClick={() => handleBotClick(bot)}
                    type="weekly"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="dashboard-section">
            <div className="header-section">
              <div>
                <h1>Monthly Profit Analysis</h1>
                <div className="subtitle-with-controls">
                  <div className="subtitle">
                    {selectedMonthData ? 'Monthly Detail View' : 'Current Month'} •
                    <div className="date-controls">
                      {selectedMonthData && (
                        <button
                          className="date-nav-btn"
                          onClick={() => setSelectedMonthData(null)}
                          title="Back to overview"
                        >
                          ←
                        </button>
                      )}
                      <span>
                        {selectedMonthData
                          ? `${new Date(selectedMonthData.monthStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                          : `${twelveMonthData.length > 0 ? new Date(twelveMonthData[0].monthStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <WeeklyStatsSummary
                weeklyNetProfit={selectedMonthData && selectedMonthData.botPerformances
                  ? selectedMonthData.botPerformances.reduce((sum, bot) => sum + (bot.net_profit || 0), 0)
                  : twelveMonthData.length > 0
                    ? twelveMonthData[0].botPerformances.reduce((sum, bot) => sum + (bot.net_profit || 0), 0)
                    : 0}
                totalProfitPercent={selectedMonthData && selectedMonthData.botPerformances
                  ? selectedMonthData.botPerformances.reduce((sum, bot) => sum + (parseFloat(bot.performance) || 0), 0).toFixed(2)
                  : twelveMonthData.length > 0
                    ? twelveMonthData[0].botPerformances.reduce((sum, bot) => sum + (parseFloat(bot.performance) || 0), 0).toFixed(2)
                    : "0.00"}
                topPerformer={selectedMonthData && selectedMonthData.botPerformances
                  ? selectedMonthData.botPerformances.reduce((best, current) => (current.performance || 0) > (best.performance || 0) ? current : best, { performance: -Infinity }).name
                  : twelveMonthData.length > 0
                    ? twelveMonthData[0].botPerformances.reduce((best, current) => (current.performance || 0) > (best.performance || 0) ? current : best, { performance: -Infinity }).name
                    : ""}
                topPerformanceValue={selectedMonthData && selectedMonthData.botPerformances
                  ? selectedMonthData.botPerformances.reduce((best, current) => (current.performance || 0) > (best.performance || 0) ? current : best, { performance: -Infinity }).performance
                  : twelveMonthData.length > 0
                    ? twelveMonthData[0].botPerformances.reduce((best, current) => (current.performance || 0) > (best.performance || 0) ? current : best, { performance: -Infinity }).performance
                    : 0}
                bottomPerformer={selectedMonthData && selectedMonthData.botPerformances
                  ? selectedMonthData.botPerformances.reduce((worst, current) => (current.performance || 0) < (worst.performance || 0) ? current : worst, { performance: Infinity }).name
                  : twelveMonthData.length > 0
                    ? twelveMonthData[0].botPerformances.reduce((worst, current) => (current.performance || 0) < (worst.performance || 0) ? current : worst, { performance: Infinity }).name
                    : ""}
                bottomPerformanceValue={selectedMonthData && selectedMonthData.botPerformances
                  ? selectedMonthData.botPerformances.reduce((worst, current) => (current.performance || 0) < (worst.performance || 0) ? current : worst, { performance: Infinity }).performance
                  : twelveMonthData.length > 0
                    ? twelveMonthData[0].botPerformances.reduce((worst, current) => (current.performance || 0) < (worst.performance || 0) ? current : worst, { performance: Infinity }).performance
                    : 0}
                profitableBots={selectedMonthData && selectedMonthData.botPerformances
                  ? selectedMonthData.botPerformances.filter(bot => (bot.performance || 0) > 0).length
                  : twelveMonthData.length > 0
                    ? twelveMonthData[0].botPerformances.filter(bot => (bot.performance || 0) > 0).length
                    : 0}
                totalBots={botsData.length}
              />
            </div>
            <div className="dashboard-container">
              <div className="chart-section">
                <ProfitChart
                  botsData={monthlyBotsData}
                  onBotHover={setHoveredBot}
                  type="monthly"
                  twelveMonthData={twelveMonthData}
                  selectedMonthData={selectedMonthData}
                  onMonthSelect={setSelectedMonthData}
                />
              </div>
              <div className="bots-list">
                {(selectedMonthData && selectedMonthData.botPerformances
                  ? selectedMonthData.botPerformances
                  : twelveMonthData.length > 0
                    ? twelveMonthData[0].botPerformances
                    : []).map((bot, index) => (
                      <BotCard
                        key={bot.id || index}
                        bot={bot}
                        index={index}
                        isHighlighted={hoveredBot === bot.name}
                        isSelected={selectedBot === bot.name}
                        onClick={() => handleBotClick(bot)}
                        type="monthly"
                      />
                    ))}
              </div>
            </div>
          </div>
          <div className="dashboard-section">
            <MultiStrategyBacktestResults />
          </div>
        </div>
      </div>
      <QuickOverview botsData={botsData} />

      {selectedBotData && tradesData && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={`Chi tiết Bot: ${selectedBotData.name}`}
        >
          <BotDetail bot={selectedBotData} trades={tradesData.trades} />
        </Modal>
      )}

      {tradesData && (
        <Modal
          isOpen={isAllTradesModalOpen}
          onClose={handleCloseAllTradesModal}
          title="Thống kê tất cả lệnh giao dịch"
        >
          <AllTradesDetail trades={tradesData.trades} />
        </Modal>
      )}
    </div>
  );
}

export default App;