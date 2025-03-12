import React, { useState, useMemo, useCallback } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import ProfitChart from './components/ProfitChart';
import BotCard from './components/BotCard';
import StatsSummary from './components/StatsSummary';
import WeeklyStatsSummary from './components/WeeklyStatsSummary';
import QuickOverview from './components/QuickOverview';
import { botsData } from './mocks/botsData';
import MultiStrategyBacktestResults from './components/BotStrategy/MultiStrategyBacktestResults';

function App() {
  const [hoveredBot, setHoveredBot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date('2025-02-09')); // dùng ngày mặc định để review.
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [selectedWeekData, setSelectedWeekData] = useState(null);

  // Handle date navigation
  const changeDate = useCallback((days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  }, [selectedDate]);

  // Get stats for selected date and previous day
  const getDateIndex = useCallback((date) => {
    return botsData[0].daily_stats.findIndex(stat =>
      new Date(stat.date).toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
  }, []);

  const selectedDateIndex = useMemo(() => getDateIndex(selectedDate), [getDateIndex, selectedDate]);

  const yesterdayDate = useMemo(() => {
    const date = new Date(selectedDate);
    date.setDate(selectedDate.getDate() - 1);
    return date;
  }, [selectedDate]);

  const previousDateIndex = useMemo(() => getDateIndex(yesterdayDate), [getDateIndex, yesterdayDate]);

  // Get selected date and previous date stats
  const selectedDateStats = useMemo(() => botsData.map(bot => ({
    name: bot.name,
    performance: bot.daily_stats[selectedDateIndex]?.profit_percent || 0,
    net_profit: bot.daily_stats[selectedDateIndex]?.net_profit || 0,
    balance: bot.daily_stats[selectedDateIndex]?.balance || 0
  })), [selectedDateIndex]);

  const previousDateStats = useMemo(() => botsData.map(bot => ({
    name: bot.name,
    performance: bot.daily_stats[previousDateIndex]?.profit_percent || 0,
    net_profit: bot.daily_stats[previousDateIndex]?.net_profit || 0,
    balance: bot.daily_stats[previousDateIndex]?.balance || 0
  })), [previousDateIndex]);

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

  // Get current balance for each bot (from latest day)
  const getCurrentBalance = useCallback((botName) => {
    const bot = botsData.find(b => b.name === botName);
    const latestStat = bot.daily_stats[selectedDateIndex];
    return latestStat?.balance || 0;
  }, [selectedDateIndex]);

  // Latest data for bot cards
  const latestBotsData = useMemo(() => selectedDateStats.map(bot => ({
    id: bot.name,
    name: bot.name,
    performance: bot.performance,
    winRate: `${botsData.find(b => b.name === bot.name).daily_stats[selectedDateIndex]?.winrate || 0}%`,
    balance: getCurrentBalance(bot.name),
    netProfit: bot.net_profit
  })), [selectedDateStats, selectedDateIndex, getCurrentBalance]);

  // Prepare weekly data
  const weeklyData = useMemo(() => Array.from({ length: 7 }).map((_, index) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(selectedDate.getDate() - index);

    return {
      date: currentDate.toISOString().split('T')[0],
      bots: botsData.map(bot => {
        const dailyStat = bot.daily_stats.find(stat =>
          new Date(stat.date).toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
        );
        return {
          id: bot.name,
          name: bot.name,
          performance: dailyStat ? dailyStat.profit_percent : 0,
          winRate: dailyStat ? `${dailyStat.winrate}%` : 'N/A',
          balance: getCurrentBalance(bot.name),
          netProfit: dailyStat ? dailyStat.net_profit : 0
        };
      })
    };
  }), [selectedDate, getCurrentBalance]);

  // Calculate weekly metrics for each bot
  const weeklyBotsData = useMemo(() => botsData.map(bot => {
    const weeklyStats = weeklyData.map(day => {
      const botStat = day.bots.find(b => b.name === bot.name);
      const dailyStat = bot.daily_stats.find(stat =>
        new Date(stat.date).toISOString().split('T')[0] === day.date
      );
      return {
        profit_percent: botStat ? botStat.performance : 0,
        winrate: dailyStat ? dailyStat.winrate : 0,
        net_profit: dailyStat ? dailyStat.net_profit : 0
      };
    });

    // Calculate total profit instead of average
    const totalProfit = parseFloat(weeklyStats.reduce((sum, day) => sum + day.profit_percent, 0).toFixed(1));
    const avgWinRate = (weeklyStats.reduce((sum, day) => sum + day.winrate, 0) / 7).toFixed(2);
    const totalNetProfit = weeklyStats.reduce((sum, day) => sum + day.net_profit, 0);

    return {
      id: bot.name,
      name: bot.name,
      performance: totalProfit,
      winRate: `${avgWinRate}%`,
      balance: getCurrentBalance(bot.name),
      netProfit: totalNetProfit
    };
  }), [weeklyData, getCurrentBalance]);

  // Calculate weekly summary metrics
  const weeklyNetProfit = useMemo(() => weeklyBotsData.reduce((sum, bot) => sum + bot.netProfit, 0), [weeklyBotsData]);

  const topWeeklyPerformer = useMemo(() =>
    weeklyBotsData.reduce((best, current) =>
      parseFloat(current.performance) > parseFloat(best.performance) ? current : best
    )
    , [weeklyBotsData]);
  const bottomWeeklyPerformer = useMemo(() =>
    weeklyBotsData.reduce((worst, current) =>
      parseFloat(current.performance) < parseFloat(worst.performance) ? current : worst
    )
    , [weeklyBotsData]);

  const avgProfitableBotsPerDay = useMemo(() =>
    weeklyBotsData.filter(bot => parseFloat(bot.performance) > 0).length
    , [weeklyBotsData]);

  // Calculate weekly total profit percent
  const weeklyTotalProfitPercent = useMemo(() =>
    weeklyBotsData.reduce((sum, bot) =>
      sum + parseFloat(bot.performance), 0).toFixed(2)
    , [weeklyBotsData]);

  // Prepare monthly data
  const monthlyData = useMemo(() => Array.from({ length: 30 }).map((_, index) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(selectedDate.getDate() - index);

    return {
      date: currentDate.toISOString().split('T')[0],
      bots: botsData.map(bot => {
        const dailyStat = bot.daily_stats.find(stat =>
          new Date(stat.date).toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
        );
        return {
          name: bot.name,
          performance: dailyStat ? dailyStat.profit_percent : 0,
          net_profit: dailyStat ? dailyStat.net_profit : 0,
          balance: dailyStat ? dailyStat.balance : 0,
          winrate: dailyStat ? dailyStat.winrate : 0
        };
      })
    };
  }), [selectedDate]);

  // Calculate monthly metrics for each bot
  const monthlyBotsData = useMemo(() => botsData.map(bot => {
    const monthlyStats = monthlyData.map(day => {
      const botStat = day.bots.find(b => b.name === bot.name);
      return {
        profit_percent: botStat ? botStat.performance : 0,
        winrate: botStat ? botStat.winrate : 0,
        net_profit: botStat ? botStat.net_profit : 0
      };
    });

    // Calculate total profit for the month instead of average
    const totalProfit = parseFloat(monthlyStats.reduce((sum, day) => sum + day.profit_percent, 0).toFixed(1));
    const avgWinRate = (monthlyStats.reduce((sum, day) => sum + day.winrate, 0) / monthlyStats.length).toFixed(2);
    const totalNetProfit = monthlyStats.reduce((sum, day) => sum + day.net_profit, 0);

    return {
      id: bot.name,
      name: bot.name,
      performance: totalProfit,
      winRate: `${avgWinRate}%`,
      balance: getCurrentBalance(bot.name),
      netProfit: totalNetProfit
    };
  }), [monthlyData, getCurrentBalance]);

  // Prepare 4-week data
  const fourWeekData = useMemo(() => Array.from({ length: 4 }).map((_, weekIndex) => {
    const endDate = new Date(selectedDate);
    endDate.setDate(selectedDate.getDate() - (weekIndex * 7));
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    // Get all days in this week
    const weekDays = Array.from({ length: 7 }).map((_, dayIndex) => {
      const currentDate = new Date(endDate);
      currentDate.setDate(endDate.getDate() - dayIndex);
      return currentDate.toISOString().split('T')[0];
    });

    // Calculate total profit for all bots in this week
    const weeklyTotalProfit = weekDays.reduce((sum, date) => {
      const dayStats = botsData.map(bot => {
        const dailyStat = bot.daily_stats.find(stat =>
          new Date(stat.date).toISOString().split('T')[0] === date
        );
        return dailyStat ? dailyStat.profit_percent : 0;
      });
      return sum + dayStats.reduce((daySum, profit) => daySum + profit, 0);
    }, 0);

    // Calculate bot performances for this week
    const botPerformances = botsData.map(bot => {
      const weeklyStats = weekDays.map(date => {
        const dailyStat = bot.daily_stats.find(stat =>
          new Date(stat.date).toISOString().split('T')[0] === date
        );
        return {
          profit_percent: dailyStat ? dailyStat.profit_percent : 0,
          winrate: dailyStat ? dailyStat.winrate : 0,
          net_profit: dailyStat ? dailyStat.net_profit : 0
        };
      });

      // Calculate total profit for this bot in this week
      const totalProfit = parseFloat(weeklyStats.reduce((sum, day) => sum + day.profit_percent, 0).toFixed(1));
      const avgWinRate = (weeklyStats.reduce((sum, day) => sum + day.winrate, 0) / 7).toFixed(2);
      const totalNetProfit = weeklyStats.reduce((sum, day) => sum + day.net_profit, 0);

      return {
        id: bot.name,
        name: bot.name,
        performance: totalProfit,
        winRate: `${avgWinRate}%`,
        balance: getCurrentBalance(bot.name),
        netProfit: totalNetProfit
      };
    });

    return {
      weekStart: startDate.toISOString().split('T')[0],
      weekEnd: endDate.toISOString().split('T')[0],
      totalProfit: parseFloat(weeklyTotalProfit.toFixed(1)),
      weekDays: weekDays,
      weekIndex,
      botPerformances
    };
  }), [selectedDate, getCurrentBalance]);

  // Prepare 12-month data
  const twelveMonthData = useMemo(() => Array.from({ length: 12 }).map((_, monthIndex) => {
    const endDate = new Date(selectedDate);
    endDate.setMonth(selectedDate.getMonth() - monthIndex);
    const startDate = new Date(endDate);
    startDate.setDate(1); // First day of month
    endDate.setDate(0); // Last day of previous month

    // Get all days in this month
    const monthDays = Array.from({ length: endDate.getDate() }).map((_, dayIndex) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(dayIndex + 1);
      return currentDate.toISOString().split('T')[0];
    });

    // Calculate total profit for all bots in this month
    const monthlyTotalProfit = monthDays.reduce((sum, date) => {
      const dayStats = botsData.map(bot => {
        const dailyStat = bot.daily_stats.find(stat =>
          new Date(stat.date).toISOString().split('T')[0] === date
        );
        return dailyStat ? dailyStat.profit_percent : 0;
      });
      return sum + dayStats.reduce((daySum, profit) => daySum + profit, 0);
    }, 0);

    // Calculate bot performances for this month
    const botPerformances = botsData.map(bot => {
      const monthlyStats = monthDays.map(date => {
        const dailyStat = bot.daily_stats.find(stat =>
          new Date(stat.date).toISOString().split('T')[0] === date
        );
        return {
          profit_percent: dailyStat ? dailyStat.profit_percent : 0,
          winrate: dailyStat ? dailyStat.winrate : 0,
          net_profit: dailyStat ? dailyStat.net_profit : 0
        };
      });

      // Calculate total profit for this bot in this month
      const totalProfit = parseFloat(monthlyStats.reduce((sum, day) => sum + day.profit_percent, 0).toFixed(1));
      const avgWinRate = (monthlyStats.reduce((sum, day) => sum + day.winrate, 0) / monthlyStats.length).toFixed(2);
      const totalNetProfit = monthlyStats.reduce((sum, day) => sum + day.net_profit, 0);

      return {
        id: bot.name,
        name: bot.name,
        performance: totalProfit,
        winRate: `${avgWinRate}%`,
        balance: getCurrentBalance(bot.name),
        netProfit: totalNetProfit
      };
    });

    return {
      monthStart: startDate.toISOString().split('T')[0],
      monthEnd: endDate.toISOString().split('T')[0],
      totalProfit: parseFloat(monthlyTotalProfit.toFixed(1)),
      monthDays: monthDays,
      monthIndex,
      monthLabel: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      botPerformances
    };
  }), [selectedDate, getCurrentBalance]);

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
                        disabled={selectedDate <= new Date('2025-01-28')}
                      >
                        ←
                      </button>
                      <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="date-picker"
                        min="2025-01-28"
                        max="2025-02-26"
                      />
                      <button
                        className="date-nav-btn"
                        onClick={() => changeDate(1)}
                        title="Next day"
                        disabled={selectedDate >= new Date('2025-02-26')}
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
                        disabled={selectedDate <= new Date('2025-01-28')}
                      >
                        ←
                      </button>
                      <span>
                        {new Date(weeklyData[6].date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })} - {new Date(weeklyData[0].date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <button
                        className="date-nav-btn"
                        onClick={() => changeDate(7)}
                        title="Next week"
                        disabled={selectedDate >= new Date('2025-02-26')}
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
                    key={bot.id}
                    bot={bot}
                    index={index}
                    isHighlighted={hoveredBot === bot.name}
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
                          : `${new Date(twelveMonthData[0].monthStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <WeeklyStatsSummary
                weeklyNetProfit={selectedMonthData ?
                  selectedMonthData.botPerformances.reduce((sum, bot) => sum + bot.netProfit, 0) :
                  twelveMonthData[0].botPerformances.reduce((sum, bot) => sum + bot.netProfit, 0)}
                totalProfitPercent={selectedMonthData ?
                  selectedMonthData.botPerformances.reduce((sum, bot) => sum + parseFloat(bot.performance), 0).toFixed(2) :
                  twelveMonthData[0].botPerformances.reduce((sum, bot) => sum + parseFloat(bot.performance), 0).toFixed(2)}
                topPerformer={selectedMonthData ?
                  selectedMonthData.botPerformances.reduce((best, current) => parseFloat(current.performance) > parseFloat(best.performance) ? current : best).name :
                  twelveMonthData[0].botPerformances.reduce((best, current) => parseFloat(current.performance) > parseFloat(best.performance) ? current : best).name}
                topPerformanceValue={selectedMonthData ?
                  selectedMonthData.botPerformances.reduce((best, current) => parseFloat(current.performance) > parseFloat(best.performance) ? current : best).performance :
                  twelveMonthData[0].botPerformances.reduce((best, current) => parseFloat(current.performance) > parseFloat(best.performance) ? current : best).performance}
                bottomPerformer={selectedMonthData ?
                  selectedMonthData.botPerformances.reduce((worst, current) => parseFloat(current.performance) < parseFloat(worst.performance) ? current : worst).name :
                  twelveMonthData[0].botPerformances.reduce((worst, current) => parseFloat(current.performance) < parseFloat(worst.performance) ? current : worst).name}
                bottomPerformanceValue={selectedMonthData ?
                  selectedMonthData.botPerformances.reduce((worst, current) => parseFloat(current.performance) < parseFloat(worst.performance) ? current : worst).performance :
                  twelveMonthData[0].botPerformances.reduce((worst, current) => parseFloat(current.performance) < parseFloat(worst.performance) ? current : worst).performance}
                profitableBots={selectedMonthData ?
                  selectedMonthData.botPerformances.filter(bot => bot.performance > 0).length :
                  twelveMonthData[0].botPerformances.filter(bot => bot.performance > 0).length}
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
                {(selectedMonthData ? selectedMonthData.botPerformances : twelveMonthData[0].botPerformances).map((bot, index) => (
                  <BotCard
                    key={bot.id}
                    bot={bot}
                    index={index}
                    isHighlighted={hoveredBot === bot.name}
                    type="monthly"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="dashboard-section">
            < MultiStrategyBacktestResults />
          </div>
        </div>
      </div>
      <QuickOverview botsData={botsData} />
    </div>
  );
}

export default App;