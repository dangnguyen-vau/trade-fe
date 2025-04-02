import React, { useState, useEffect, useRef } from 'react';
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
import annotationPlugin from 'chartjs-plugin-annotation';
import './MultiStrategyBacktestResults.css';
import {
  fetchDailyStats,
  fetchWeeklyStats,
  fetchMonthlyStats,
  fetchAvailableTradesData,
  fetchAggregatedStats,
  fetchAllBotsData,
  fetchBalanceData
} from '../../services/api';
import Modal from '../ui/Modal';
import AllTradesDetail from '../trades/AllTradesDetail';

// Đăng ký các components cần thiết
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
  Legend,
  annotationPlugin
);

// Cấu hình mặc định để ẩn tất cả labels
ChartJS.defaults.plugins.datalabels = {
  display: false
};
ChartJS.defaults.plugins.labels = {
  render: () => null
};

const MultiStrategyBacktestResults = () => {
  const [timeframe, setTimeframe] = useState('day'); // day, week, month
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAllTradesModalOpen, setIsAllTradesModalOpen] = useState(false);

  // Dữ liệu từ API
  const [dailyStats, setDailyStats] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [tradesData, setTradesData] = useState(null);
  const [botsData, setBotsData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);

  // Thống kê tổng hợp
  const [aggregatedStats, setAggregatedStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    winRate: 0,
    totalProfit: 0,
    averageProfit: 0,
    maxDrawdown: 0,
    currentBalance: 0
  });

  // Mở modal xem tất cả lệnh
  const handleOpenAllTradesModal = () => {
    setIsAllTradesModalOpen(true);
  };

  // Đóng modal xem tất cả lệnh
  const handleCloseAllTradesModal = () => {
    setIsAllTradesModalOpen(false);
  };

  // Lấy dữ liệu từ API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tất cả dữ liệu cần thiết từ backend
        const [
          aggregatedData, 
          tradesResult, 
          botsResult, 
          daily, 
          weekly, 
          monthly,
          balance
        ] = await Promise.all([
          fetchAggregatedStats(),
          fetchAvailableTradesData(),
          fetchAllBotsData(),
          fetchDailyStats(new Date()),
          fetchWeeklyStats(new Date()),
          fetchMonthlyStats(new Date()),
          fetchBalanceData()
        ]);

        // Lưu dữ liệu vào state
        setAggregatedStats(aggregatedData || {
          totalTrades: 0,
          winningTrades: 0,
          winRate: 0,
          totalProfit: 0,
          averageProfit: 0,
          maxDrawdown: 0,
          currentBalance: 0
        });
        setTradesData(tradesResult);
        setBotsData(botsResult);
        setDailyStats(daily || []);
        setWeeklyStats(weekly || []);
        setMonthlyStats(monthly || []);
        setBalanceData(balance);

      } catch (error) {
        console.error('Error loading data:', error);
        setError(`Không thể tải dữ liệu. Lỗi: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Tạo dữ liệu cho biểu đồ dựa trên timeframe đã chọn
  const formatChartData = () => {
    if (!botsData || botsData.length === 0) {
      return null;
    }

    // Lấy dữ liệu từ bot đầu tiên (hoặc có thể thay bằng cách gộp dữ liệu từ tất cả bot)
    const bot = botsData[0];

    switch (timeframe) {
      case 'day':
        return formatDailyChartData(bot.daily_stats || []);
      case 'week':
        return formatWeeklyChartData(bot.weekly_stats || []);
      case 'month':
        return formatMonthlyChartData(bot.monthly_stats || []);
      default:
        return formatDailyChartData(bot.daily_stats || []);
    }
  };

  // Định dạng dữ liệu cho biểu đồ ngày
  const formatDailyChartData = (dailyStats) => {
    if (!dailyStats || dailyStats.length === 0) {
      return null;
    }

    // Sắp xếp dữ liệu theo ngày
    const sortedData = [...dailyStats].sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Tính lợi nhuận tích lũy
    let cumulativeProfit = 0;
    const chartData = sortedData.map((day) => {
      cumulativeProfit += day.net_profit || 0;
      return {
        date: new Date(day.date).toLocaleDateString(),
        dailyProfit: day.net_profit || 0,
        cumulativeProfit: cumulativeProfit,
        trades: day.trades_count || 0,
        winRate: day.winrate || 0
      };
    });

    return {
      labels: chartData.map(item => item.date),
      datasets: [
        {
          label: 'Lợi nhuận tích lũy',
          data: chartData.map(item => item.cumulativeProfit),
          type: 'line',
          fill: true,
          backgroundColor: 'rgba(79, 143, 252, 0.1)',
          borderColor: 'rgba(79, 143, 252, 1)',
          tension: 0,
          yAxisID: 'y',
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          label: 'Lợi nhuận hàng ngày',
          data: chartData.map(item => item.dailyProfit),
          type: 'bar',
          backgroundColor: (context) => {
            const value = context.parsed.y;
            return value >= 0
              ? 'rgba(37, 206, 164, 0.6)'
              : 'rgba(255, 77, 77, 0.6)';
          },
          borderColor: (context) => {
            const value = context.parsed.y;
            return value >= 0
              ? 'rgba(37, 206, 164, 0.8)'
              : 'rgba(255, 77, 77, 0.8)';
          },
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y1'
        }
      ],
      metadata: {
        trades: chartData.map(item => item.trades),
        winRates: chartData.map(item => item.winRate)
      }
    };
  };

  // Định dạng dữ liệu cho biểu đồ tuần
  const formatWeeklyChartData = (weeklyStats) => {
    if (!weeklyStats || weeklyStats.length === 0) {
      return null;
    }

    // Sắp xếp dữ liệu theo tuần
    const sortedData = [...weeklyStats].sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Tính lợi nhuận tích lũy
    let cumulativeProfit = 0;
    const chartData = sortedData.map((week) => {
      cumulativeProfit += week.net_profit || 0;
      return {
        date: new Date(week.date).toLocaleDateString(),
        weeklyProfit: week.net_profit || 0,
        cumulativeProfit: cumulativeProfit,
        trades: week.trades_count || 0,
        winRate: week.winrate || 0
      };
    });

    return {
      labels: chartData.map(item => item.date),
      datasets: [
        {
          label: 'Lợi nhuận tích lũy',
          data: chartData.map(item => item.cumulativeProfit),
          type: 'line',
          fill: true,
          backgroundColor: 'rgba(79, 143, 252, 0.1)',
          borderColor: 'rgba(79, 143, 252, 1)',
          tension: 0,
          yAxisID: 'y',
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          label: 'Lợi nhuận hàng tuần',
          data: chartData.map(item => item.weeklyProfit),
          type: 'bar',
          backgroundColor: (context) => {
            const value = context.parsed.y;
            return value >= 0
              ? 'rgba(37, 206, 164, 0.6)'
              : 'rgba(255, 77, 77, 0.6)';
          },
          borderColor: (context) => {
            const value = context.parsed.y;
            return value >= 0
              ? 'rgba(37, 206, 164, 0.8)'
              : 'rgba(255, 77, 77, 0.8)';
          },
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y1'
        }
      ],
      metadata: {
        trades: chartData.map(item => item.trades),
        winRates: chartData.map(item => item.winRate)
      }
    };
  };

  // Định dạng dữ liệu cho biểu đồ tháng
  const formatMonthlyChartData = (monthlyStats) => {
    if (!monthlyStats || monthlyStats.length === 0) {
      return null;
    }

    // Sắp xếp dữ liệu theo tháng
    const sortedData = [...monthlyStats].sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Tính lợi nhuận tích lũy
    let cumulativeProfit = 0;
    const chartData = sortedData.map((month) => {
      cumulativeProfit += month.net_profit || 0;
      return {
        date: new Date(month.date).toLocaleDateString(),
        monthlyProfit: month.net_profit || 0,
        cumulativeProfit: cumulativeProfit,
        trades: month.trades_count || 0,
        winRate: month.winrate || 0
      };
    });

    return {
      labels: chartData.map(item => item.date),
      datasets: [
        {
          label: 'Lợi nhuận tích lũy',
          data: chartData.map(item => item.cumulativeProfit),
          type: 'line',
          fill: true,
          backgroundColor: 'rgba(79, 143, 252, 0.1)',
          borderColor: 'rgba(79, 143, 252, 1)',
          tension: 0,
          yAxisID: 'y',
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          label: 'Lợi nhuận hàng tháng',
          data: chartData.map(item => item.monthlyProfit),
          type: 'bar',
          backgroundColor: (context) => {
            const value = context.parsed.y;
            return value >= 0
              ? 'rgba(37, 206, 164, 0.6)'
              : 'rgba(255, 77, 77, 0.6)';
          },
          borderColor: (context) => {
            const value = context.parsed.y;
            return value >= 0
              ? 'rgba(37, 206, 164, 0.8)'
              : 'rgba(255, 77, 77, 0.8)';
          },
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y1'
        }
      ],
      metadata: {
        trades: chartData.map(item => item.trades),
        winRates: chartData.map(item => item.winRate)
      }
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

  // Format dữ liệu cho biểu đồ
  const chartData = formatChartData();

  // Lấy thông tin số dư hiện tại
  const currentBalance = balanceData?.total || 0;

  // Cấu hình chart
  const chartOptions = {
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
        text: `Biểu đồ lợi nhuận ${timeframe === 'day' ? 'hàng ngày' :
          timeframe === 'week' ? 'hàng tuần' : 'hàng tháng'
          }`,
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
            return `Ngày: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            const value = context.parsed.y;
            const label = context.dataset.label;

            return `${label}: ${value >= 0 ? '+' : ''}${value.toFixed(2)} USDT`;
          },
          afterLabel: (context) => {
            const dataIndex = context.dataIndex;

            // Thêm thông tin về số giao dịch và tỷ lệ thắng
            if (chartData && chartData.metadata && chartData.metadata.trades && chartData.metadata.winRates) {
              const trades = chartData.metadata.trades[dataIndex] || 0;
              const winRate = chartData.metadata.winRates[dataIndex] || 0;

              return [
                `Số giao dịch: ${trades}`,
                `Tỷ lệ thắng: ${winRate.toFixed(1)}%`
              ];
            }

            return '';
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Thời gian',
          color: 'rgba(248, 250, 252, 0.9)',
          font: {
            size: 14,
            weight: '500'
          },
          padding: { top: 20 }
        },
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(248, 250, 252, 0.7)',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12
          },
          padding: 8,
          maxTicksLimit: timeframe === 'day' ? 15 : (timeframe === 'week' ? 12 : 12)
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
          padding: { bottom: 20 }
        },
        grid: {
          color: 'rgba(248, 250, 252, 0.1)',
          drawBorder: false,
          // Thêm vạch kẻ ngang 0 từ grid
          lineWidth: (context) => {
            return context.tick.value === 0 ? 1 : 0.1;
          },
          color: (context) => {
            return context.tick.value === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(248, 250, 252, 0.1)';
          }
        },
        ticks: {
          color: 'rgba(248, 250, 252, 0.7)',
          maxTicksLimit: 8,
          callback: (value) => {
            if (Math.abs(value) >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value.toFixed(2);
          },
          // Đảm bảo vạch 0 luôn hiển thị
          includeBounds: true,
          sampleSize: 8
        },
        border: {
          display: false
        },
        // Đảm bảo hiển thị giá trị 0
        grace: '5%',
        beginAtZero: false,
        suggestedMin: function (scale) {
          return scale.min < 0 ? scale.min : -0.1;
        }
      },
      y1: {
        display: true,
        position: 'right',
        title: {
          display: true,
          text: `Lợi nhuận ${timeframe === 'day' ? 'hàng ngày' :
            timeframe === 'week' ? 'hàng tuần' : 'hàng tháng'
            } (USDT)`,
          color: 'rgba(248, 250, 252, 0.9)',
          font: {
            size: 14,
            weight: '500'
          },
          padding: { bottom: 20 }
        },
        grid: {
          drawOnChartArea: false,
          drawBorder: false,
          // Thêm vạch kẻ ngang 0 từ grid 
          lineWidth: (context) => {
            return context.tick.value === 0 ? 1 : 0.1;
          },
          color: (context) => {
            return context.tick.value === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(248, 250, 252, 0.1)';
          }
        },
        ticks: {
          color: 'rgba(248, 250, 252, 0.7)',
          maxTicksLimit: 6,
          callback: (value) => {
            if (Math.abs(value) >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value.toFixed(2);
          },
          // Đảm bảo vạch 0 luôn hiển thị
          includeBounds: true,
          sampleSize: 6
        },
        border: {
          display: false
        },
        // Đảm bảo hiển thị giá trị 0
        grace: '5%',
        beginAtZero: false,
        suggestedMin: function (scale) {
          return scale.min < 0 ? scale.min : -0.1;
        }
      }
    }
  };

  return (
    <div className="strategy-backtest-results">
      <div className="strategy-header">
        <h2 className="strategy-section-title">Thống kê hiệu suất tổng thể</h2>

        <div className='right-selector'>
          <div className="strategy-actions">
            <button
              className="view-all-trades-btn"
              onClick={handleOpenAllTradesModal}
            >
              Xem tất cả lệnh
            </button>
          </div>
          <div className="strategy-timeframe-selector">
            <label className={timeframe === 'day' ? 'active' : ''}>
              <input
                type="radio"
                value="day"
                checked={timeframe === 'day'}
                onChange={() => setTimeframe('day')}
              />
              <span>Theo ngày</span>
            </label>
            <label className={timeframe === 'week' ? 'active' : ''}>
              <input
                type="radio"
                value="week"
                checked={timeframe === 'week'}
                onChange={() => setTimeframe('week')}
              />
              <span>Theo tuần</span>
            </label>
            <label className={timeframe === 'month' ? 'active' : ''}>
              <input
                type="radio"
                value="month"
                checked={timeframe === 'month'}
                onChange={() => setTimeframe('month')}
              />
              <span>Theo tháng</span>
            </label>
          </div>
        </div>

      </div>

      <div className="strategy-stats-container">
        <div className="strategy-stat-box">
          <h3>Tổng số giao dịch</h3>
          <p>{aggregatedStats.totalTrades || 0}</p>
        </div>
        <div className="strategy-stat-box">
          <h3>Giao dịch thắng</h3>
          <p>{aggregatedStats.winningTrades || 0}</p>
        </div>
        <div className="strategy-stat-box">
          <h3>Tỷ lệ thắng</h3>
          <p>{aggregatedStats.winRate || 0}%</p>
        </div>
        <div className="strategy-stat-box">
          <h3>Tổng lợi nhuận</h3>
          <p>{aggregatedStats.totalProfit || 0} USDT</p>
        </div>
        <div className="strategy-stat-box">
          <h3>Lợi nhuận trung bình</h3>
          <p>{aggregatedStats.averageProfit || 0} USDT</p>
        </div>
        <div className="strategy-stat-box">
          <h3>Drawdown tối đa</h3>
          <p>{aggregatedStats.maxDrawdown || 0} USDT</p>
        </div>
        <div className="strategy-stat-box">
          <h3>Số dư hiện tại</h3>
          <p>{typeof currentBalance === 'number' ? currentBalance.toFixed(2) : '0.00'} USDT</p>
        </div>
      </div>

      {chartData && (
        <div className="strategy-chart-container">
          {/* Sử dụng key để buộc Line component re-render hoàn toàn khi timeframe thay đổi */}
          <Line
            key={`chart-${timeframe}`}
            data={chartData}
            options={chartOptions}
          />
        </div>
      )}

      {/* Modal hiển thị tất cả lệnh */}
      <Modal 
        isOpen={isAllTradesModalOpen}
        title="Tất cả lệnh giao dịch"
        onClose={handleCloseAllTradesModal}
      >
        <AllTradesDetail trades={tradesData?.trades || []} />
      </Modal>
    </div>
  );
};

export default MultiStrategyBacktestResults; 