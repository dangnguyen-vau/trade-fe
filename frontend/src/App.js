import React, { useState, useMemo, useCallback, useEffect } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import ProfitChart from './components/ProfitChart';
import BotCard from './components/BotCard';
import StatsSummary from './components/StatsSummary';
import WeeklyStatsSummary from './components/WeeklyStatsSummary';
import QuickOverview from './components/QuickOverview';
import BotDetail from './components/BotDetail';
import MultiStrategyBacktestResults from './components/BotStrategy/MultiStrategyBacktestResults';
import { 
  fetchTradesData, 
  fetchBalanceData, 
  fetchProfitData, 
  fetchDailyData,
  fetchWeeklyData,
  fetchMonthlyData 
} from './services/api';
import { 
  transformTradeData, 
  getDailyStats, 
  getWeeklyStats, 
  getMonthlyStats 
} from './services/dataTransform';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [botsData, setBotsData] = useState([]);
  const [tradesData, setTradesData] = useState(null);
  const [hoveredBot, setHoveredBot] = useState(null);
  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [selectedWeekData, setSelectedWeekData] = useState(null);

  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const trades = await fetchTradesData();
        const balance = await fetchBalanceData();
        const profit = await fetchProfitData();
        const daily = await fetchDailyData();
        const weekly = await fetchWeeklyData();
        const monthly = await fetchMonthlyData();

        setTradesData(trades); // Lưu tradesData để sử dụng trong BotDetail
        
        const transformedData = transformTradeData(
          trades,
          balance,
          profit,
          daily,
          weekly,
          monthly
        );

        setBotsData(transformedData);

        // Tìm ngày cuối cùng có dữ liệu để thiết lập làm mặc định
        if (profit && profit.latest_trade_date) {
          setSelectedDate(new Date(profit.latest_trade_date));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý khi click vào bot
  const handleBotClick = useCallback((bot) => {
    setSelectedBot(bot.name === selectedBot ? null : bot.name);
  }, [selectedBot]);

  // Handle date navigation
  const changeDate = useCallback((days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  }, [selectedDate]);

  // Get daily stats for selected date
  const selectedDateStats = useMemo(() => 
    getDailyStats(botsData, selectedDate)
  , [botsData, selectedDate]);

  // Get daily stats for previous day
  const yesterdayDate = useMemo(() => {
    const date = new Date(selectedDate);
    date.setDate(selectedDate.getDate() - 1);
    return date;
  }, [selectedDate]);

  const previousDateStats = useMemo(() => 
    getDailyStats(botsData, yesterdayDate)
  , [botsData, yesterdayDate]);

  // Calculate metrics for selected date
  const selectedNetProfit = useMemo(() =>
    selectedDateStats.reduce((sum, bot) => sum + bot.performance, 0).toFixed(1)
  , [selectedDateStats]);

  const previousNetProfit = useMemo(() =>
    previousDateStats.reduce((sum, bot) => sum + bot.performance, 0).toFixed(1)
  , [previousDateStats]);

  const netProfitChange = useMemo(() =>
    (selectedNetProfit - previousNetProfit).toFixed(1)
  , [selectedNetProfit, previousNetProfit]);

  // Calculate today's net profit amount
  const todayNetProfitAmount = useMemo(() =>
    selectedDateStats.reduce((sum, bot) => sum + bot.net_profit, 0)
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
    selectedDateStats.filter(bot => bot.performance > 0).length
  , [selectedDateStats]);

  const profitableBotsYesterday = useMemo(() =>
    previousDateStats.filter(bot => bot.performance > 0).length
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

  // Prepare weekly data
  const weeklyData = useMemo(() => Array.from({ length: 7 }).map((_, index) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(selectedDate.getDate() - index);
    
    return {
      date: currentDate.toISOString().split('T')[0],
      bots: getDailyStats(botsData, currentDate).map(bot => ({
        id: bot.name,
        ...bot
      }))
    };
  }), [botsData, selectedDate]);

  // Calculate weekly stats
  const weeklyBotsData = useMemo(() => 
    getWeeklyStats(botsData, selectedDate)
  , [botsData, selectedDate]);

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

  // Prepare 4-week data
  const fourWeekData = useMemo(() => Array.from({ length: 4 }).map((_, weekIndex) => {
    const endDate = new Date(selectedDate);
    endDate.setDate(selectedDate.getDate() - (weekIndex * 7));
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    // Get botPerformances for this week
    const botPerformances = getWeeklyStats(botsData, endDate).map(bot => ({
      id: bot.name,
      ...bot
    }));

    // Calculate total profit for the week
    const totalProfit = botPerformances.reduce((sum, bot) => sum + (bot.performance || 0), 0);

    return {
      weekStart: startDate.toISOString().split('T')[0],
      weekEnd: endDate.toISOString().split('T')[0],
      totalProfit: parseFloat(totalProfit.toFixed(1)),
      weekIndex,
      botPerformances
    };
  }), [botsData, selectedDate]);

  // Prepare monthly data
  const monthlyData = useMemo(() => Array.from({ length: 30 }).map((_, index) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(selectedDate.getDate() - index);
    
    return {
      date: currentDate.toISOString().split('T')[0],
      bots: getDailyStats(botsData, currentDate).map(bot => ({
        name: bot.name,
        performance: bot.performance || 0,
        net_profit: bot.net_profit || 0,
        balance: bot.balance || 0,
        winrate: parseInt(bot.winRate) || 0
      }))
    };
  }), [botsData, selectedDate]);

  // Calculate monthly stats
  const monthlyBotsData = useMemo(() => 
    getMonthlyStats(botsData, selectedDate)
  , [botsData, selectedDate]);

  // Prepare 12-month data
  const twelveMonthData = useMemo(() => Array.from({ length: 12 }).map((_, monthIndex) => {
    const endDate = new Date(selectedDate);
    endDate.setMonth(selectedDate.getMonth() - monthIndex);
    const startDate = new Date(endDate);
    startDate.setDate(1); // First day of month

    // Get botPerformances for this month
    const botPerformances = getMonthlyStats(botsData, endDate).map(bot => ({
      id: bot.name,
      ...bot
    }));

    // Calculate total profit for the month
    const totalProfit = botPerformances.reduce((sum, bot) => sum + (bot.performance || 0), 0);

    return {
      monthStart: startDate.toISOString().split('T')[0],
      monthEnd: endDate.toISOString().split('T')[0],
      totalProfit: parseFloat(totalProfit.toFixed(1)),
      monthIndex,
      monthLabel: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      botPerformances
    };
  }), [botsData, selectedDate]);

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
          
          {selectedBotData && tradesData && (
            <div className="dashboard-section">
              <BotDetail bot={selectedBotData} trades={tradesData.trades} />
            </div>
          )}
          
          <div className="dashboard-section">
            <div className="header-section">
              <div>
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
              </div>
              <StatsSummary
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
            <div className="dashboard-container">
              <div className="chart-section">
                <ProfitChart
                  botsData={latestBotsData}
                  onBotHover={setHoveredBot}
                  type="daily"
                  weeklyData={weeklyData}
                  selectedDayData={selectedDayData}
                  setSelectedDayData={setSelectedDayData}
                />
              </div>
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
    </div>
  );
}

export default App;