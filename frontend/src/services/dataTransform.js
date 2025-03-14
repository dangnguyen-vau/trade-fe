// Hàm chuyển đổi dữ liệu từ API thành định dạng cho frontend
export const transformTradeData = (tradesData, balanceData, profitData, dailyData, weeklyData, monthlyData) => {
    if (!tradesData || !balanceData || !profitData || !dailyData || !weeklyData || !monthlyData) {
        return [];
    }

    // Lấy danh sách tất cả các bot duy nhất từ trades (thông qua trường strategy)
    const botNames = [...new Set(tradesData.trades.map(trade => trade.strategy))];

    // Tạo cấu trúc dữ liệu bot
    const botsData = botNames.map(botName => {
        // Lọc các giao dịch của bot này
        const botTrades = tradesData.trades.filter(trade => trade.strategy === botName);

        // Tính tổng lợi nhuận và số giao dịch thắng/thua
        const totalProfit = botTrades.reduce((sum, trade) => sum + trade.realized_profit, 0);
        const winningTrades = botTrades.filter(trade => trade.profit_pct > 0).length;
        const winRate = botTrades.length > 0 ? (winningTrades / botTrades.length) * 100 : 0;

        // Tạo dữ liệu hàng ngày cho bot này, dựa trên giao dịch
        // Tạo mảng các ngày từ giao dịch đầu tiên đến giao dịch cuối cùng
        const startDate = new Date(profitData.first_trade_date);
        const endDate = new Date(profitData.latest_trade_date);

        // Tạo mảng chứa tất cả các ngày trong khoảng
        const allDates = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            allDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Tạo dữ liệu daily_stats
        const daily_stats = allDates.map(date => {
            const dateStr = date.toISOString().split('T')[0];

            // Tìm tất cả giao dịch hoàn thành trong ngày này của bot cụ thể
            const tradesOnDate = botTrades.filter(trade => {
                const tradeDate = new Date(trade.close_date).toISOString().split('T')[0];
                return tradeDate === dateStr;
            });

            // Tính tổng lợi nhuận trong ngày
            const total_dailyProfit = tradesOnDate.reduce((sum, trade) => sum + trade.profit_abs, 0);
            const total_dailyProfitPercent = tradesOnDate.reduce((sum, trade) => sum + trade.profit_pct, 0);

            // Tính win rate trong ngày
            const dailyWinningTrades = tradesOnDate.filter(trade => trade.profit_pct > 0).length;
            const dailyWinRate = tradesOnDate.length > 0 ? (dailyWinningTrades / tradesOnDate.length) * 100 : 0;

            return {
                date: dateStr,
                profit_percent: total_dailyProfitPercent,
                net_profit: total_dailyProfit,
                winrate: dailyWinRate,
                total_win: dailyWinningTrades,
                trades_count: tradesOnDate.length,
            };
        });

        // Tạo weekly_stats từ daily_stats bằng cách gộp dữ liệu theo tuần
        const weekly_stats = weeklyData.data.map(week => {
            // Lấy ngày bắt đầu và kết thúc của tuần
            const weekDate = new Date(week.date);
            const weekStart = new Date(weekDate);
            const weekEnd = new Date(weekDate);
            weekEnd.setDate(weekEnd.getDate() + 6); // Thêm 6 ngày để có tuần đầy đủ

            // Lọc các giao dịch của bot hiện tại trong tuần này
            const tradesInWeek = botTrades.filter(trade => {
                const tradeDate = new Date(trade.close_date.replace(" ", "T"));
                return tradeDate >= weekStart && tradeDate <= weekEnd;
            });

            // Tính toán lợi nhuận thực tế của bot trong tuần
            const weeklyProfit = tradesInWeek.reduce((sum, trade) => sum + trade.realized_profit, 0);

            // Tính tổng số vố bỏ ra
            const stakeAmount = tradesInWeek.reduce((sum, trade) => sum + trade.stake_amount, 0);

            // Tính tỷ lệ lợi nhuận dựa trên số giao dịch thực tế
            const profitPercent = tradesInWeek.length > 0
                ? (weeklyProfit / stakeAmount) * 100
                : 0;

            // Tính win rate trong tuần
            const winningTrades = tradesInWeek.filter(trade => trade.realized_profit > 0).length;
            const weeklyWinRate = tradesInWeek.length > 0
                ? (winningTrades / tradesInWeek.length) * 100
                : 0;

            return {
                date: weekDate.toISOString().split('T')[0],
                trades_count: tradesInWeek.length,
                net_profit: weeklyProfit,
                profit_percent: profitPercent,
                win_count: winningTrades,
                winrate: weeklyWinRate,
            };
        });
        // Tạo monthly_stats từ daily_stats bằng cách gộp dữ liệu theo tháng
        const monthly_stats = monthlyData.data.map(month => {
            // Lấy ngày bắt đầu và kết thúc của tháng
            const monthDate = new Date(month.date);
            const monthStart = new Date(monthDate);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0); // Lấy ngày cuối cùng của tháng

            // Lọc các giao dịch của bot hiện tại trong tháng này
            const tradesInMonth = botTrades.filter(trade => {
                const tradeDate = new Date(trade.close_date.replace(" ", "T"));
                return tradeDate >= monthStart && tradeDate <= monthEnd;
            });

            // Tính toán lợi nhuận thực tế của bot trong tháng
            const monthlyProfit = tradesInMonth.reduce((sum, trade) => sum + trade.realized_profit, 0);

            // Tính tổng số vốn bỏ ra
            const stakeAmount = tradesInMonth.reduce((sum, trade) => sum + trade.stake_amount, 0);

            // Tính tỷ lệ lợi nhuận dựa trên số giao dịch thực tế
            const profitPercent = tradesInMonth.length > 0
                ? (monthlyProfit / stakeAmount) * 100
                : 0;

            // Tính win rate trong tháng
            const winningTrades = tradesInMonth.filter(trade => trade.realized_profit > 0).length;
            const monthlyWinRate = tradesInMonth.length > 0
                ? (winningTrades / tradesInMonth.length) * 100
                : 0;

            return {
                date: monthDate.toISOString().split('T')[0],
                trades_count: tradesInMonth.length,
                net_profit: monthlyProfit,
                profit_percent: profitPercent,
                win_count: winningTrades,
                winrate: monthlyWinRate,
            };
        });

        const currentBalance = {
            balance_starting: balanceData.starting_capital || 0,
            balance_current: balanceData.total || 0,
            balance_percent: balanceData.starting_capital
                ? ((balanceData.total - balanceData.starting_capital) / balanceData.starting_capital * 100).toFixed(2)
                : 0
        }

        return {
            id: botName,
            name: botName,
            daily_stats,
            weekly_stats,
            monthly_stats,
            current_balance: currentBalance,
            total_profit: totalProfit,
            win_rate: winRate.toFixed(2),
            trades_count: botTrades.length
        };
    });

    return botsData;
};

// Hàm lấy thống kê theo ngày
export const getDailyStats = (botsData, date) => {
    if (!botsData || botsData.length === 0) return [];

    return botsData.map(bot => {
        const dailyStat = bot.daily_stats.find(stat =>
            new Date(stat.date).toISOString().split('T')[0] === date.toISOString().split('T')[0]
        ) || {};

        return {
            name: bot.name,
            performance: dailyStat.profit_percent || 0,
            net_profit: dailyStat.net_profit || 0,
            winRate: `${dailyStat.winrate || 0}%`,
            trades: dailyStat.trades_count || 0,
            win_count: dailyStat.total_win || 0
        };
    });
};

// Hàm lấy thống kê theo tuần
export const getWeeklyStats = (botsData, endDate) => {
    if (!botsData || botsData.length === 0) return [];

    // Tìm ngày đầu tuần (cách 7 ngày)
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    return botsData.map(bot => {
        // Lấy từ weekly_stats nếu có
        const weeklyStat = bot.weekly_stats.find(stat => {
            const statDate = new Date(stat.date);
            return statDate >= startDate && statDate <= endDate;
        }) || {};

        return {
            name: bot.name,
            performance: weeklyStat.profit_percent || 0,
            net_profit: weeklyStat.net_profit || 0,
            winRate: `${weeklyStat.winrate || 0}%`,
            trades: weeklyStat.trades_count || 0,
            win_count: weeklyStat.win_count || 0,
            balance: bot.current_balance
        };
    });
};

// Hàm lấy thống kê theo tháng
export const getMonthlyStats = (botsData, date) => {
    if (!botsData || botsData.length === 0) return [];

    // Tính ngày đầu tháng và cuối tháng
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return botsData.map(bot => {
        // Lấy từ monthly_stats nếu có
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthlyStat = bot.monthly_stats.find(stat => stat.date.startsWith(monthYear)) || {};

        return {
            name: bot.name,
            performance: monthlyStat.profit_percent || 0,
            net_profit: monthlyStat.net_profit || 0,
            winRate: `${monthlyStat.winrate || 0}%`,
            trades: monthlyStat.trades_count || 0,
            win_count: monthlyStat.win_count || 0,
            balance: bot.current_balance
        };
    });
};