import React from 'react';
import { COLORS } from '../constants/colors';

function WeeklyStatsSummary({
  weeklyNetProfit,
  totalProfitPercent,
  topPerformer,
  topPerformanceValue,
  bottomPerformer,
  bottomPerformanceValue,
  profitableBots,
  totalBots
}) {
  // Format currency in USD
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
        <div className="summary-value" style={{ color: totalProfitPercent >= 0 ? COLORS.status.success : COLORS.status.danger }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>{totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent}%</span>
            <span>({weeklyNetProfit >= 0 ? '+' : ''}{formatCurrency(weeklyNetProfit)})</span>
          </div>
        </div>
        <div className="summary-label">TOTAL PROFIT</div>
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
        </div>
        <div className="summary-label">PROFITABLE BOTS</div>
      </div>
    </div>
  );
}

export default WeeklyStatsSummary; 