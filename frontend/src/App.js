import React, { useState, useMemo, useCallback, useEffect } from 'react';
import './App.css';
import TopBar from './components/layout/TopBar';
import ProfitChart from './components/ui/ProfitChart';
import BotCard from './components/bot/BotCard';
import DailyStatsSummary from './components/stats/DailyStatsSummary';
import WeeklyStatsSummary from './components/stats/WeeklyStatsSummary';
import QuickOverview from './components/layout/QuickOverview';
import BotDetail from './components/bot/BotDetail';
import Modal from './components/ui/Modal';
import MultiStrategyBacktestResults from './components/strategy/MultiStrategyBacktestResults';
import {
  fetchAvailableTradesData,
  fetchAllBotsData,
  fetchMetadata,
  fetchDailyStats,
  fetchWeeklyStats,
  fetchMonthlyStats,
  fetchAvailableWeeks,
  fetchAvailableMonths
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
  const [fourWeekData, setFourWeekData] = useState([]);
  const [twelveMonthData, setTwelveMonthData] = useState([]);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

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
        const [botsDataFetch, trades, metadata, weeksData, monthsData] = await Promise.all([
          fetchAllBotsData(),
          fetchAvailableTradesData(),
          fetchMetadata(),
          fetchAvailableWeeks(),
          fetchAvailableMonths()
        ]);

        setTradesData(trades);
        setAvailableWeeks(weeksData || []);
        setAvailableMonths(monthsData || []);

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
        // Sử dụng tuần đang chọn nếu có sẵn
        if (availableWeeks.length > 0 && selectedWeekIndex >= 0) {
          const selectedWeek = availableWeeks[selectedWeekIndex];
          const endDate = new Date(selectedWeek.endDate);
          const data = await fetchWeeklyStats(endDate);
          setWeeklyBotsData(data || []);
        } else {
          console.warn('Dữ liệu tuần thiếu hoặc là chọn index trong tất cả tuần không có');
        }
      } catch (error) {
        console.error('Error fetching weekly stats:', error);
        setWeeklyBotsData([]);
      }
    };

    fetchWeeklyStatsData();
  }, [availableWeeks, selectedWeekIndex]);

  // Fetch dữ liệu thống kê tháng
  useEffect(() => {
    const fetchMonthlyStatsData = async () => {
      try {
        // Sử dụng tháng đang chọn nếu có sẵn
        if (availableMonths.length > 0 && selectedMonthIndex >= 0) {
          const selectedMonth = availableMonths[selectedMonthIndex];
          if (!selectedMonth || !selectedMonth.endDate) {
            console.error('Không tìm thấy tháng hợp lệ hoặc tháng không có endDate');
            setMonthlyBotsData([]);
            return;
          }

          const endDate = new Date(selectedMonth.endDate);
          if (isNaN(endDate.getTime())) {
            console.error('endDate không hợp lệ:', selectedMonth.endDate);
            setMonthlyBotsData([]);
            return;
          }

          const data = await fetchMonthlyStats(endDate);
          setMonthlyBotsData(data || []);
        } else {
          console.warn('Dữ liệu trong tháng thiếu hoặc là chưa chọn dữ liệu index trong tháng');
        }
      } catch (error) {
        console.error('Error fetching monthly stats:', error);
        setMonthlyBotsData([]);
      }
    };

    fetchMonthlyStatsData();
  }, [availableMonths, selectedMonthIndex]);

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

  // Fetch dữ liệu four week data (4 tuần) - sử dụng available weeks
  useEffect(() => {
    const fetchFourWeekData = async () => {
      try {
        if (availableWeeks.length === 0) return;

        // Lấy tối đa 4 tuần gần nhất từ danh sách availableWeeks
        const weeksToUse = availableWeeks.slice(0, 4);
        const promises = weeksToUse.map((week, weekIndex) => {
          const endDate = new Date(week.endDate);
          const startDate = new Date(week.startDate);

          return fetchWeeklyStats(endDate)
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
                weekLabel: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
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
                weekLabel: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                botPerformances: []
              };
            });
        });

        const result = await Promise.all(promises);
        setFourWeekData(result);
      } catch (error) {
        console.error('Error fetching four week data:', error);
        setFourWeekData([]);
      }
    };

    fetchFourWeekData();
  }, [availableWeeks]);

  // Fetch dữ liệu twelve month data - sử dụng available months
  useEffect(() => {
    const fetchTwelveMonthData = async () => {
      try {
        if (availableMonths.length === 0) return;

        // Lấy tối đa 12 tháng gần nhất từ danh sách availableMonths
        const monthsToUse = availableMonths.slice(0, 12);
        const promises = monthsToUse.map((month, monthIndex) => {
          // Kiểm tra dữ liệu tháng có hợp lệ không
          if (!month || !month.endDate) {
            console.error(`Invalid month data at index ${monthIndex}:`, month);
            return Promise.resolve({
              monthStart: null,
              monthEnd: null,
              totalProfit: 0,
              monthIndex,
              monthLabel: `Tháng không hợp lệ`,
              botPerformances: []
            });
          }

          const endDate = new Date(month.endDate);
          const startDate = new Date(month.startDate);

          if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
            console.error(`Invalid date for month at index ${monthIndex}:`, month);
            return Promise.resolve({
              monthStart: null,
              monthEnd: null,
              totalProfit: 0,
              monthIndex,
              monthLabel: `Tháng không hợp lệ`,
              botPerformances: []
            });
          }

          return fetchMonthlyStats(endDate)
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
                monthLabel: startDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
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
                monthLabel: startDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
                botPerformances: []
              };
            });
        });

        const result = await Promise.all(promises);
        setTwelveMonthData(result.filter(item => item.monthStart !== null));
      } catch (error) {
        console.error('Error fetching twelve month data:', error);
        setTwelveMonthData([]);
      }
    };

    fetchTwelveMonthData();
  }, [availableMonths]);

  // Handle date navigation
  const changeDate = useCallback((days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  }, [selectedDate]);

  // Chuyển đổi tuần trước/sau
  const changeWeek = useCallback((direction) => {
    if (availableWeeks.length === 0) return;

    const newIndex = selectedWeekIndex + direction;
    if (newIndex >= 0 && newIndex < availableWeeks.length) {
      setSelectedWeekIndex(newIndex);
    }
  }, [selectedWeekIndex, availableWeeks]);

  // Chuyển đổi tháng trước/sau
  const changeMonth = useCallback((direction) => {
    if (availableMonths.length === 0) return;

    const newIndex = selectedMonthIndex + direction;
    if (newIndex >= 0 && newIndex < availableMonths.length) {
      setSelectedMonthIndex(newIndex);
    }
  }, [selectedMonthIndex, availableMonths]);

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
    fourWeekData,
    twelveMonthData,
    changeDate,
    availableWeeks,
    availableMonths,
    selectedWeekIndex,
    selectedMonthIndex,
    changeWeek,
    changeMonth
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
    fourWeekData,
    twelveMonthData,
    changeDate,
    availableWeeks,
    availableMonths,
    selectedWeekIndex,
    selectedMonthIndex,
    changeWeek,
    changeMonth
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
                        onClick={() => changeWeek(1)}
                        title="Previous week"
                        disabled={selectedWeekIndex >= availableWeeks.length - 1}
                      >
                        ←
                      </button>
                      <span>
                        {availableWeeks.length > 0 && selectedWeekIndex < availableWeeks.length ?
                          `${new Date(availableWeeks[selectedWeekIndex].startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })} - ${new Date(availableWeeks[selectedWeekIndex].endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}` :
                          (weeklyData.length > 0 ?
                            `${weeklyData.length > 6 ? new Date(weeklyData[6].date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            }) : ''} - ${new Date(weeklyData[0].date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}` :
                            'No weekly data available'
                          )
                        }
                      </span>
                      <button
                        className="date-nav-btn"
                        onClick={() => changeWeek(-1)}
                        title="Next week"
                        disabled={selectedWeekIndex <= 0}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tổng thể của tuần */}
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
            {/* Chia hai bên */}
            <div className="dashboard-container">
              {/* Biểu đồ chi tiết tuần */}
              <div className="chart-section">
                <ProfitChart
                  onBotHover={setHoveredBot}
                  type="weekly"
                  fourWeekData={fourWeekData} // Dữ liệu 4 tuần sau select
                  weeklyData={weeklyData} // Dữ liệu 7 ngày trong tuần select
                  selectedWeekData={selectedWeekData}
                  setSelectedWeekData={setSelectedWeekData}
                />
              </div>
              {/* Card bot tuần */}
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
                      {selectedMonthData ? (
                        <button
                          className="date-nav-btn"
                          onClick={() => setSelectedMonthData(null)}
                          title="Back to overview"
                        >
                          ←
                        </button>
                      ) : (
                        <>
                          <button
                            className="date-nav-btn"
                            onClick={() => changeMonth(1)}
                            title="Previous month"
                            disabled={selectedMonthIndex >= availableMonths.length - 1}
                          >
                            ←
                          </button>
                          <span>
                            {availableMonths.length > 0 && selectedMonthIndex < availableMonths.length ?
                              `${new Date(availableMonths[selectedMonthIndex].startDate).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric'
                              })}` :
                              (twelveMonthData.length > 0 ?
                                `${new Date(twelveMonthData[0].monthStart).toLocaleDateString('en-US', {
                                  month: 'long',
                                  year: 'numeric'
                                })}` :
                                'No monthly data available'
                              )
                            }
                          </span>
                          <button
                            className="date-nav-btn"
                            onClick={() => changeMonth(-1)}
                            title="Next month"
                            disabled={selectedMonthIndex <= 0}
                          >
                            →
                          </button>
                        </>
                      )}
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
    </div>
  );
}

export default App;