import React from 'react';
import { COLORS } from '../constants/colors';

function StatsSummary({ 
  todayNetProfit, 
  todayNetProfitChange,
  topPerformer,
  topPerformanceValue,
  bottomPerformer,
  bottomPerformanceValue,
  profitableBots,
  totalBots,
  profitableBotsChange,
  todayNetProfitAmount
}) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="stats-summary">
      <div className="summary-item">
        <div className="summary-value" style={{ color: todayNetProfit >= 0 ? COLORS.status.success : COLORS.status.danger }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>{todayNetProfit >= 0 ? '+' : ''}{todayNetProfit}%</span>
            <span>({todayNetProfitAmount >= 0 ? '+' : ''}{formatCurrency(todayNetProfitAmount)})</span>
          </div>
          <span className="change-indicator" style={{ color: todayNetProfitChange >= 0 ? COLORS.status.success : COLORS.status.danger }}>
            ({todayNetProfitChange >= 0 ? '↑' : '↓'}{Math.abs(todayNetProfitChange)}% vs yesterday)
          </span>
        </div>
        <div className="summary-label">TODAY'S TOTAL PROFIT</div>
      </div>

      <div className="summary-item">
        <div className="summary-value" style={{ color: COLORS.status.success }}>
          {topPerformer}
          <span className="profit-value">(+{topPerformanceValue}%)</span>
        </div>
        <div className="summary-label">TOP PROFIT BOT</div>
      </div>

      <div className="summary-item">
        <div className="summary-value" style={{ color: COLORS.status.danger }}>
          {bottomPerformer}
          <span className="profit-value">({bottomPerformanceValue}%)</span>
        </div>
        <div className="summary-label">LOWEST PROFIT BOT</div>
      </div>

      <div className="summary-item">
        <div className="summary-value">
          {profitableBots}/{totalBots}
          <span className="change-indicator" style={{ color: profitableBotsChange >= 0 ? COLORS.status.success : COLORS.status.danger }}>
            ({profitableBotsChange >= 0 ? '↑' : '↓'}{Math.abs(profitableBotsChange)} vs yesterday)
          </span>
        </div>
        <div className="summary-label">PROFITABLE BOTS</div>
      </div>
    </div>
  );
}

export default StatsSummary; 