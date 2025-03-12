import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './MultiStrategyBacktestResults.css';

// Đăng ký plugin để ẩn labels
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

// Cấu hình mặc định để ẩn tất cả labels
ChartJS.defaults.plugins.datalabels = {
  display: false
};
ChartJS.defaults.plugins.labels = {
  render: () => null
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003';

console.log('Using API URL:', API_URL); // Debug log

const StrategyCard = ({ strategy, isSelected, onSelect, data }) => {
  const stats = data ? {
    totalTrades: data.trades?.length || 0,
    winRate: data.trades ? 
      ((data.trades.filter(t => t.profit_ratio > 0).length / data.trades.length) * 100).toFixed(1) : 0,
    totalProfit: data.trades ? 
      data.trades.reduce((sum, trade) => sum + trade.profit_abs, 0).toFixed(2) : 0
  } : { totalTrades: 0, winRate: 0, totalProfit: 0 };

  return (
    <div 
      className={`strategy-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(strategy)}
    >
      <div className="strategy-card-header">
        <h3>{strategy}</h3>
        <div className="strategy-card-badge">
          {data?.metadata?.timeframe || 'N/A'}
        </div>
      </div>
      <div className="strategy-card-stats">
        <div className="strategy-card-stat">
          <span className="stat-value">{stats.totalTrades}</span>
          <span className="stat-label">Giao dịch</span>
        </div>
        <div className="strategy-card-stat">
          <span className="stat-value">{stats.winRate}%</span>
          <span className="stat-label">Thắng</span>
        </div>
        <div className="strategy-card-stat">
          <span className={`stat-value ${parseFloat(stats.totalProfit) >= 0 ? 'profit' : 'loss'}`}>
            {parseFloat(stats.totalProfit) >= 0 ? '+' : ''}{stats.totalProfit}
          </span>
          <span className="stat-label">USDT</span>
        </div>
      </div>
      {isSelected && <div className="strategy-card-selected-icon">✓</div>}
    </div>
  );
};

const MultiStrategyBacktestResults = () => {
  const [backtestData, setBacktestData] = useState({});
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBacktestData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Đọc trực tiếp từ thư mục public/data
        const files = [
          'sample_strategy.json',
          'backtest-result-2025-02-21_18-40-09&strategy=BOT1ShortStrategy.json',
          'backtest-result-2025-02-21_18-40-19&strategy=Bot1LongStrategy.json',
          'backtest-result-2025-02-21_18-41-59&strategy=BOT1BothAllPhaseStrategy.json',
          'backtest-result-2025-02-21_18-37-09&strategy=ExampleLSTMStrategy.json',
          'backtest-result-2025-02-21_18-37-09&strategy=ThanhStrategy.json',
          'backtest-result-2025-02-21_18-39-36&strategy=BOT1BothStrategy.json'
        ];

        const strategyData = {};
        const strategyNames = [];

        // Lấy nội dung của từng file
        for (const file of files) {
          try {
            console.log('Fetching file:', file); // Debug log
            
            const response = await fetch(`/data/${file}`);

            if (!response.ok) {
              console.error(`Failed to fetch data for ${file}. Status: ${response.status}`);
              continue;
            }

            const data = await response.json();
            console.log(`Data for ${file}:`, data); // Debug log

            if (!data.backtest_result?.strategy) {
              console.error(`Invalid data structure for ${file}`);
              continue;
            }

            const strategyName = Object.keys(data.backtest_result.strategy)[0];
            strategyData[strategyName] = {
              ...data.backtest_result.strategy[strategyName],
              metadata: data.backtest_result.metadata[strategyName]
            };
            strategyNames.push(strategyName);
          } catch (error) {
            console.error(`Error loading data for ${file}:`, error);
          }
        }

        if (strategyNames.length === 0) {
          throw new Error('No valid strategy data found');
        }

        setBacktestData(strategyData);
        setStrategies(strategyNames);
        setSelectedStrategy(strategyNames[0]);
      } catch (error) {
        console.error('Error loading backtest data:', error);
        setError(`Failed to load backtest data: ${error.message}. API URL: ${API_URL}`);
      } finally {
        setLoading(false);
      }
    };

    loadBacktestData();
  }, []);

  const calculateStats = (strategy) => {
    if (!strategy) return {};

    const trades = strategy.trades || [];
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => trade.profit_ratio > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(2) : 0;

    // Tính tổng lợi nhuận từ profit_abs thay vì profit_ratio
    const totalProfit = trades.reduce((sum, trade) => sum + trade.profit_abs, 0).toFixed(2);

    // Tính toán thêm các chỉ số khác
    const averageProfit = totalTrades > 0 ? (totalProfit / totalTrades).toFixed(2) : 0;
    const maxDrawdown = strategy.max_drawdown_abs || 0;
    const averageDuration = strategy.duration_avg || "N/A";

    return {
      totalTrades,
      winningTrades,
      winRate,
      totalProfit,
      averageProfit,
      maxDrawdown,
      averageDuration
    };
  };

  const calculateProfitInRange = (trades, startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Lọc giao dịch trong khoảng thời gian
    const tradesInRange = trades.filter(trade => {
      const tradeDate = new Date(trade.close_date);
      return tradeDate >= start && tradeDate <= end;
    });

    // Tính tổng lợi nhuận và số lệnh
    const totalProfit = tradesInRange.reduce((sum, trade) => sum + trade.profit_ratio * 100, 0);
    const numberOfTrades = tradesInRange.length;

    // Tính tỷ lệ win
    const winningTrades = tradesInRange.filter(trade => trade.profit_ratio > 0).length;
    const winRate = numberOfTrades > 0 ? (winningTrades / numberOfTrades * 100) : 0;

    // Tính trung bình lợi nhuận trên mỗi lệnh
    const averageProfit = numberOfTrades > 0 ? totalProfit / numberOfTrades : 0;

    return {
      averageProfit: averageProfit.toFixed(2),
      numberOfTrades,
      winRate: winRate.toFixed(2)
    };
  };

  const formatChartData = (strategy) => {
    if (!strategy) return null;

    const trades = strategy.trades || [];
    
    // Sắp xếp các lệnh theo thời gian
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.close_date) - new Date(b.close_date)
    );

    // Tính lợi nhuận tích lũy và dữ liệu cho từng lệnh
    let cumulativeProfit = 0;
    const tradeData = sortedTrades.map((trade, index) => {
      cumulativeProfit += trade.profit_abs;
      return {
        index: index + 1,
        profit: trade.profit_abs,
        cumulative: cumulativeProfit,
        date: new Date(trade.close_date).toLocaleString(),
        pair: trade.pair
      };
    });

    return {
      labels: tradeData.map(trade => `#${trade.index}`),
      datasets: [
        {
          label: 'Lợi nhuận tích lũy',
          data: tradeData.map(trade => trade.cumulative),
          type: 'line',
          fill: true,
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          borderColor: 'rgba(56, 189, 248, 1)',
          tension: 0.3,
          yAxisID: 'y',
          pointRadius: 3,
          pointHoverRadius: 6,
          datalabels: {
            display: false
          }
        },
        {
          label: 'Lợi nhuận từng lệnh',
          data: tradeData.map(trade => trade.profit),
          type: 'bar',
          backgroundColor: (context) => {
            const value = context.parsed.y;
            return value >= 0 
              ? 'rgba(34, 197, 94, 0.6)' 
              : 'rgba(239, 68, 68, 0.6)';
          },
          borderColor: (context) => {
            const value = context.parsed.y;
            return value >= 0 
              ? 'rgba(34, 197, 94, 0.8)' 
              : 'rgba(239, 68, 68, 0.8)';
          },
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y1',
          datalabels: {
            display: false
          }
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="strategy-loading-state">
        <div className="strategy-loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="strategy-error-state">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  const stats = selectedStrategy ? calculateStats(backtestData[selectedStrategy]) : {};
  const chartData = selectedStrategy ? formatChartData(backtestData[selectedStrategy]) : null;

  return (
    <div className="strategy-backtest-results">
      <div className="strategy-cards-container">
        <h2 className="strategy-section-title">Chọn chiến lược</h2>
        <div className="strategy-cards-grid">
          {strategies.map(strategy => (
            <StrategyCard
              key={strategy}
              strategy={strategy}
              isSelected={strategy === selectedStrategy}
              onSelect={setSelectedStrategy}
              data={backtestData[strategy]}
            />
          ))}
        </div>
      </div>

      {selectedStrategy && (
        <>
          <div className="strategy-info">
            <h2>{selectedStrategy}</h2>
            <p>Timeframe: {backtestData[selectedStrategy]?.metadata?.timeframe}</p>
            <p>Thời gian backtest: {
              new Date(backtestData[selectedStrategy]?.metadata?.backtest_start_ts * 1000).toLocaleDateString()
            } - {
                new Date(backtestData[selectedStrategy]?.metadata?.backtest_end_ts * 1000).toLocaleDateString()
              }</p>
          </div>

          <div className="strategy-stats-container">
            <div className="strategy-stat-box">
              <h3>Tổng số giao dịch</h3>
              <p>{stats.totalTrades}</p>
            </div>
            <div className="strategy-stat-box">
              <h3>Giao dịch thắng</h3>
              <p>{stats.winningTrades}</p>
            </div>
            <div className="strategy-stat-box">
              <h3>Tỷ lệ thắng</h3>
              <p>{stats.winRate}%</p>
            </div>
            <div className="strategy-stat-box">
              <h3>Tổng lợi nhuận</h3>
              <p>{stats.totalProfit} USDT</p>
            </div>
            <div className="strategy-stat-box">
              <h3>Lợi nhuận trung bình</h3>
              <p>{stats.averageProfit} USDT</p>
            </div>
            <div className="strategy-stat-box">
              <h3>Drawdown tối đa</h3>
              <p>{stats.maxDrawdown} USDT</p>
            </div>
            <div className="strategy-stat-box">
              <h3>Thời gian giao dịch TB</h3>
              <p>{stats.averageDuration}</p>
            </div>
          </div>

          <div className="strategy-timeframe-selector">
            <label>
              <input
                type="radio"
                value="day"
                checked={selectedTimeframe === 'day'}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              />
              Theo ngày
            </label>
            <label>
              <input
                type="radio"
                value="month"
                checked={selectedTimeframe === 'month'}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              />
              Theo tháng
            </label>
          </div>

          {chartData && (
            <div className="strategy-chart-container">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: 'rgba(248, 250, 252, 0.8)',
                        font: {
                          size: 14,
                          weight: '500'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20
                      }
                    },
                    datalabels: {
                      display: false
                    },
                    labels: {
                      render: () => null
                    },
                    title: {
                      display: true,
                      text: 'Biểu đồ lợi nhuận theo thời gian',
                      color: 'rgba(248, 250, 252, 0.8)',
                      font: {
                        size: 18,
                        weight: '600'
                      },
                      padding: {
                        top: 10,
                        bottom: 30
                      }
                    },
                    tooltip: {
                      enabled: true,
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      titleColor: 'rgba(248, 250, 252, 0.9)',
                      bodyColor: 'rgba(248, 250, 252, 0.9)',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      borderWidth: 1,
                      padding: 15,
                      boxPadding: 8,
                      usePointStyle: true,
                      callbacks: {
                        title: (tooltipItems) => {
                          const index = tooltipItems[0].dataIndex + 1;
                          const trades = selectedStrategy ? backtestData[selectedStrategy].trades : [];
                          const sortedTrades = [...trades].sort((a, b) => 
                            new Date(a.close_date) - new Date(b.close_date)
                          );
                          const trade = sortedTrades[tooltipItems[0].dataIndex];
                          if (trade) {
                            return `Lệnh #${index}\n${trade.pair}\n${new Date(trade.close_date).toLocaleString()}`;
                          }
                          return `Lệnh #${index}`;
                        },
                        label: (context) => {
                          const value = context.parsed.y;
                          const label = context.dataset.label;
                          return `${label}: ${value >= 0 ? '+' : ''}${value.toFixed(2)} USDT`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      display: true,
                      title: {
                        display: true,
                        text: 'Số thứ tự lệnh',
                        color: 'rgba(248, 250, 252, 0.9)',
                        font: {
                          size: 14,
                          weight: '500'
                        },
                        padding: {top: 20}
                      },
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: 'rgba(248, 250, 252, 0.7)',
                        maxRotation: 0,
                        minRotation: 0,
                        font: {
                          size: 12
                        },
                        padding: 8,
                        callback: (value, index) => `#${index + 1}`,
                        maxTicksLimit: 15
                      }
                    },
                    y: {
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Lợi nhuận tích lũy (USDT)',
                        color: 'rgba(248, 250, 252, 0.9)',
                        font: {
                          size: 14,
                          weight: '500'
                        },
                        padding: {bottom: 20}
                      },
                      grid: {
                        color: 'rgba(248, 250, 252, 0.1)',
                        drawBorder: false
                      },
                      ticks: {
                        display: false,
                        maxTicksLimit: 8,
                        callback: (value) => {
                          if (Math.abs(value) >= 1000) {
                            return (value / 1000).toFixed(1) + 'K';
                          }
                          return value.toFixed(0);
                        }
                      },
                      border: {
                        display: false
                      }
                    },
                    y1: {
                      display: true,
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Lợi nhuận từng lệnh (USDT)',
                        color: 'rgba(248, 250, 252, 0.9)',
                        font: {
                          size: 14,
                          weight: '500'
                        },
                        padding: {bottom: 20}
                      },
                      grid: {
                        drawOnChartArea: false,
                        drawBorder: false
                      },
                      ticks: {
                        display: false,
                        maxTicksLimit: 6,
                        callback: (value) => {
                          if (Math.abs(value) >= 1000) {
                            return (value / 1000).toFixed(1) + 'K';
                          }
                          return value.toFixed(0);
                        }
                      },
                      border: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MultiStrategyBacktestResults; 
