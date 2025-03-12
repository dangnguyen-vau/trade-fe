import React, { useState } from 'react';
import { COLORS } from '../constants/colors';
import './QuickOverview.css';

function QuickOverview({ botsData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Tính toán các chỉ số tổng quan từ dữ liệu mới nhất
  const calculateOverview = () => {
    // Lấy dữ liệu mới nhất (index 0 trong daily_stats)
    const latestStats = botsData.map(bot => ({
      netProfit: bot.daily_stats[0].net_profit,
      balance: bot.daily_stats[0].balance,
      winRate: bot.daily_stats[0].winrate
    }));

    const totalProfit = latestStats.reduce((sum, stat) => sum + stat.netProfit, 0);
    const totalBalance = latestStats.reduce((sum, stat) => sum + stat.balance, 0);
    const averageWinRate = latestStats.reduce((sum, stat) => sum + stat.winRate, 0) / latestStats.length;

    return {
      totalProfit,
      totalBalance,
      averageWinRate: averageWinRate.toFixed(2)
    };
  };

  const { totalProfit, totalBalance, averageWinRate } = calculateOverview();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className={`quick-overview ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className="overview-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2>Quick Overview</h2>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      
      <div className="overview-content">
        <div className="overview-item">
          <div className="item-label">Total Net Profit</div>
          <div 
            className="item-value"
            style={{ color: totalProfit >= 0 ? COLORS.status.success : COLORS.status.danger }}
          >
            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
          </div>
        </div>

        <div className="overview-item">
          <div className="item-label">Total Balance</div>
          <div className="item-value">{formatCurrency(totalBalance)}</div>
        </div>

        <div className="overview-item">
          <div className="item-label">Average Win Rate</div>
          <div 
            className="item-value"
            style={{ color: averageWinRate >= 65 ? COLORS.status.success : COLORS.status.warning }}
          >
            {averageWinRate}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickOverview; 