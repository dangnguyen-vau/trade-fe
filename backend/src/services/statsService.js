// Đường dẫn: backend/src/services/statsService.js
const { getLocalTradesData } = require('./tradeService');
const { getLocalBalanceData } = require('./balanceService');

/**
 * Tính toán thống kê tổng hợp từ dữ liệu giao dịch
 * @returns {Object} Thống kê tổng hợp
 */
const calculateAggregatedStats = () => {
    const trades = getLocalTradesData();
    
    if (!trades || !trades.trades || trades.trades.length === 0) {
        return null;
    }

    const allTrades = trades.trades;
    const totalTrades = allTrades.length;
    const winningTrades = allTrades.filter(trade => trade.profit_pct > 0).length;
    const winRate = (winningTrades / totalTrades * 100).toFixed(2);
    const totalProfit = allTrades.reduce((sum, trade) => sum + trade.profit_abs, 0);
    const averageProfit = (totalProfit / totalTrades).toFixed(2);

    // Tính max drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let cumulativeProfit = 0;

    // Sắp xếp giao dịch theo thời gian
    const sortedTrades = [...allTrades].sort((a, b) =>
        new Date(a.close_date) - new Date(b.close_date)
    );

    sortedTrades.forEach(trade => {
        cumulativeProfit += trade.profit_abs;
        if (cumulativeProfit > peak) {
            peak = cumulativeProfit;
        }
        
        const drawdown = peak - cumulativeProfit;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    });

    // Lấy thông tin balance
    const balanceData = getLocalBalanceData();
    const currentBalance = balanceData && balanceData.total ? balanceData.total : 0;

    return {
        totalTrades,
        winningTrades,
        winRate,
        totalProfit: totalProfit.toFixed(2),
        averageProfit,
        maxDrawdown: maxDrawdown.toFixed(2),
        currentBalance
    };
};

module.exports = {
    calculateAggregatedStats
};