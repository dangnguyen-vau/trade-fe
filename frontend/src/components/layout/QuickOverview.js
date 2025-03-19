import React, { useState } from 'react';
import '../../constants/colors';
import './QuickOverview.css';

function QuickOverview({ botsData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Tính toán các chỉ số tổng quan từ dữ liệu mới nhất
  const calculateOverview = () => {
    // Lấy dữ liệu mới nhất (index 0 trong daily_stats)
    const latestStats = botsData.map(bot => ({
      netProfit: bot.daily_stats[0].net_profit,
      winRate: bot.daily_stats[0].winrate
    }));

    const totalProfit = latestStats.reduce((sum, stat) => sum + stat.netProfit, 0);
    const averageWinRate = latestStats.reduce((sum, stat) => sum + stat.winRate, 0) / latestStats.length;

    return {
      totalProfit,
      averageWinRate: averageWinRate.toFixed(2)
    };
  };

  const { totalProfit, averageWinRate } = calculateOverview();

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
      <div className="overview-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Quick Overview</h3>
        <span className="expand-icon">{isExpanded ? '▼' : '▲'}</span>
      </div>
      {isExpanded && (
        <div className="overview-content">
          <div className="overview-item">
            <span className="item-label">Total Profit</span>
            <span className={`item-value ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalProfit)}
            </span>
          </div>
          
          <div className="overview-item">
            <span className="item-label">Average Win Rate</span>
            <span className="item-value">{averageWinRate}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuickOverview; 