import React from 'react';
import './BotCard.css';

const BotCard = ({ bot, index, isHighlighted, isSelected, type, onClick, selectedDate }) => {
  if (!bot) return null;
  
  // Lấy dữ liệu hiển thị dựa trên loại (daily, weekly, monthly)
  const perfColor = bot.performance > 0 ? 'positive' : bot.performance < 0 ? 'negative' : '';
  
  return (
    <div 
      className={`bot-card ${isHighlighted ? 'highlighted' : ''}`}
      onClick={() => onClick && onClick(bot)}
    >
      <div className="bot-card-header">
        <h3 className="bot-name">{bot.name}</h3>
        <div className={`bot-performance ${perfColor}`}>
          {bot.performance.toFixed(2)}%
        </div>
      </div>
      
      <div className="bot-card-body">
        {/* <div className="bot-metric">
          <span className="metric-label">Win Rate:</span>
          <span className="metric-value">{bot.winRate}</span>
        </div>
         */}
        <div className="bot-metric">
          <span className="metric-label">Net Profit:</span>
          <span className={`metric-value ${bot.net_profit > 0 ? 'positive' : bot.net_profit < 0 ? 'negative' : ''}`}>
            {bot.net_profit.toFixed(2)} USDT
          </span>
        </div>
        
        {bot.trades !== undefined && (
          <div className="bot-metric">
            <span className="metric-label">Trades:</span>
            <span className="metric-value">{bot.trades}</span>
          </div>
        )}
      </div>
      
      <div className="bot-card-footer">
        <span className="view-details">Xem chi tiết <i className="detail-icon">&#128269;</i></span>
      </div>
    </div>
  );
};

export default BotCard; 