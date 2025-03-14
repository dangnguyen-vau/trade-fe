import React, { useState } from 'react';
import './BotDetail.css';

const BotDetail = ({ bot, trades }) => {
  const [showAllTrades, setShowAllTrades] = useState(false);
  
  if (!bot || !trades) return null;
  
  // Lọc giao dịch của bot này
  const botTrades = trades.filter(trade => trade.strategy === bot.name);
  
  // Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
  const sortedTrades = [...botTrades].sort((a, b) => {
    return new Date(b.close_date) - new Date(a.close_date);
  });
  
  // Chỉ hiển thị 5 giao dịch gần nhất nếu không chọn hiển thị tất cả
  const displayTrades = showAllTrades ? sortedTrades : sortedTrades.slice(0, 5);
  
  return (
    <div className="bot-detail-container">
      <div className="bot-detail-header">
        <h2>{bot.name}</h2>
        <div className="bot-detail-stats">
          <div className="stat-item">
            <span className="stat-label">Tổng lợi nhuận:</span>
            <span className={`stat-value ${bot.total_profit >= 0 ? 'positive' : 'negative'}`}>
              {bot.total_profit.toFixed(2)} USDT
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Win Rate:</span>
            <span className="stat-value">{bot.win_rate}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Số lệnh:</span>
            <span className="stat-value">{bot.trades_count}</span>
          </div>
        </div>
      </div>
      
      <div className="trades-section">
        <h3>Các giao dịch gần đây</h3>
        <table className="trades-table">
          <thead>
            <tr>
              <th>Cặp</th>
              <th>Loại</th>
              <th>Ngày mở</th>
              <th>Ngày đóng</th>
              <th>Lợi nhuận (%)</th>
              <th>Lợi nhuận (USDT)</th>
              <th>Lý do đóng</th>
            </tr>
          </thead>
          <tbody>
            {displayTrades.map(trade => (
              <tr key={trade.trade_id} className={trade.profit_pct >= 0 ? 'positive-trade' : 'negative-trade'}>
                <td>{trade.pair}</td>
                <td>{trade.is_short ? 'Short' : 'Long'}</td>
                <td>{new Date(trade.open_date).toLocaleString()}</td>
                <td>{new Date(trade.close_date).toLocaleString()}</td>
                <td className={trade.profit_pct >= 0 ? 'positive' : 'negative'}>
                  {trade.profit_pct.toFixed(2)}%
                </td>
                <td className={trade.profit_abs >= 0 ? 'positive' : 'negative'}>
                  {trade.profit_abs.toFixed(2)}
                </td>
                <td>{trade.exit_reason || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {botTrades.length > 5 && (
          <button 
            className="show-more-btn"
            onClick={() => setShowAllTrades(!showAllTrades)}
          >
            {showAllTrades ? 'Hiển thị ít hơn' : `Hiển thị thêm (${botTrades.length - 5} lệnh)`}
          </button>
        )}
      </div>
    </div>
  );
};

export default BotDetail; 