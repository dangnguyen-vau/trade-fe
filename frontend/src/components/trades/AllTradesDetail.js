import React, { useState } from 'react';
import '../bot/BotDetail.css'; // Sử dụng CSS từ BotDetail

const AllTradesDetail = ({ trades }) => {
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [filterBot, setFilterBot] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'profit', 'bot'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  
  if (!trades) return null;
  
  // Lấy danh sách tất cả bot duy nhất từ trades
  const allBots = ['all', ...new Set(trades.map(trade => trade.strategy))];
  
  // Lọc lệnh theo bot
  const filteredTrades = filterBot === 'all' 
    ? trades 
    : trades.filter(trade => trade.strategy === filterBot);
  
  // Sắp xếp lệnh
  const sortedTrades = [...filteredTrades].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.close_date);
      const dateB = new Date(b.close_date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    } else if (sortBy === 'profit') {
      return sortOrder === 'desc' 
        ? b.profit_abs - a.profit_abs 
        : a.profit_abs - b.profit_abs;
    } else if (sortBy === 'bot') {
      return sortOrder === 'desc'
        ? b.strategy.localeCompare(a.strategy)
        : a.strategy.localeCompare(b.strategy);
    }
    return 0;
  });
  
  // Chỉ hiển thị 20 lệnh gần nhất nếu không chọn hiển thị tất cả
  const displayTrades = showAllTrades ? sortedTrades : sortedTrades.slice(0, 20);
  
  // Tính tổng lợi nhuận và số lệnh thắng/thua
  const totalProfit = filteredTrades.reduce((sum, trade) => sum + trade.profit_abs, 0);
  const winningTrades = filteredTrades.filter(trade => trade.profit_pct > 0).length;
  const winRate = filteredTrades.length > 0 
    ? (winningTrades / filteredTrades.length * 100).toFixed(2) 
    : 0;

  // Hàm thay đổi sắp xếp
  const handleSortChange = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  return (
    <div className="bot-detail-container">
      <div className="bot-detail-header">
        <h2>Thống kê tất cả các lệnh giao dịch</h2>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Lọc theo Bot:</label>
            <select 
              value={filterBot} 
              onChange={(e) => setFilterBot(e.target.value)}
              className="filter-select"
            >
              {allBots.map(bot => (
                <option key={bot} value={bot}>
                  {bot === 'all' ? 'Tất cả các Bot' : bot}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="bot-detail-stats">
          <div className="stat-item">
            <span className="stat-label">Tổng lợi nhuận:</span>
            <span className={`stat-value ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
              {totalProfit.toFixed(2)} USDT
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Win Rate:</span>
            <span className="stat-value">{winRate}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Số lệnh:</span>
            <span className="stat-value">{filteredTrades.length}</span>
          </div>
        </div>
      </div>
      
      <div className="trades-section">
        <h3>Các lệnh giao dịch</h3>
        <table className="trades-table">
          <thead>
            <tr>
              <th onClick={() => handleSortChange('bot')} className="sortable-column">
                Bot {sortBy === 'bot' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Cặp</th>
              <th>Loại</th>
              <th onClick={() => handleSortChange('date')} className="sortable-column">
                Ngày đóng {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSortChange('profit')} className="sortable-column">
                Lợi nhuận (%) {sortBy === 'profit' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Lợi nhuận (USDT)</th>
              <th>Lý do đóng</th>
            </tr>
          </thead>
          <tbody>
            {displayTrades.map(trade => (
              <tr key={`${trade.strategy}-${trade.trade_id}`} className={trade.profit_pct >= 0 ? 'positive-trade' : 'negative-trade'}>
                <td>{trade.strategy}</td>
                <td>{trade.pair}</td>
                <td>{trade.is_short ? 'Short' : 'Long'}</td>
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
        
        {filteredTrades.length > 20 && (
          <button 
            className="show-more-btn"
            onClick={() => setShowAllTrades(!showAllTrades)}
          >
            {showAllTrades ? 'Hiển thị ít hơn' : `Hiển thị thêm (${filteredTrades.length - 20} lệnh)`}
          </button>
        )}
      </div>
    </div>
  );
};

export default AllTradesDetail; 