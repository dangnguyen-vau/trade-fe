const { getLocalTradesData } = require('./tradeService');
const { getLocalBalanceData } = require('./balanceService');
const { getLocalProfitData } = require('./profitService');
const { getLocalDailyData } = require('./TimeOver/dailyService');
const { getLocalWeeklyData } = require('./TimeOver/weeklyService');
const { getLocalMonthlyData } = require('./TimeOver/monthlyService');

/**
 * Chuyển đổi dữ liệu từ nhiều nguồn thành cấu trúc dữ liệu bot để sử dụng ở frontend
 * @param {boolean} useConsolidated - Sử dụng dữ liệu tổng hợp hay không
 * @returns {Array} Mảng dữ liệu các bot đã được xử lý
 */
function transformTradeData(useConsolidated = true) {
    // Lấy dữ liệu từ các nguồn
    const tradesData = getLocalTradesData();
    const balanceData = getLocalBalanceData();
    const profitData = getLocalProfitData();
    const dailyData = getLocalDailyData();
    const weeklyData = getLocalWeeklyData();
    const monthlyData = getLocalMonthlyData();

    // Kiểm tra toàn diện dữ liệu đầu vào
    if (!tradesData || !tradesData.trades || !Array.isArray(tradesData.trades) || tradesData.trades.length === 0) {
        console.warn('Thiếu dữ liệu giao dịch hoặc định dạng không hợp lệ');
        return [];
    }
    
    if (!balanceData || typeof balanceData !== 'object') {
        console.warn('Thiếu dữ liệu balance hoặc định dạng không hợp lệ');
        return [];
    }
    
    if (!profitData || typeof profitData !== 'object' || !profitData.first_trade_date || !profitData.latest_trade_date) {
        console.warn('Thiếu dữ liệu profit hoặc định dạng không hợp lệ');
        return [];
    }
    
    // Kiểm tra thêm các dữ liệu khác
    if (!dailyData || !weeklyData || !monthlyData) {
        console.warn('Thiếu dữ liệu thống kê theo thời gian');
        return [];
    }

    // Lấy danh sách tất cả các bot duy nhất từ trades
    // Sử dụng botId nếu có, nếu không thì dùng strategy như trước
    const botNames = [...new Set(tradesData.trades.map(trade => trade.botId || trade.strategy))];

    // Tạo cấu trúc dữ liệu bot
    const botsData = botNames.map(botName => {
        // Tất cả giao dịch của 1 bot, ưu tiên dùng botId trước, nếu không có thì dùng strategy
        const botTrades = tradesData.trades.filter(trade => 
            (trade.botId && trade.botId === botName) || 
            (!trade.botId && trade.strategy === botName)
        );

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
        let daily_stats = [];
        
        if (useConsolidated && dailyData && dailyData.data) {
            // Sử dụng dữ liệu tổng hợp từ tất cả các bot nếu là view tổng hợp
            daily_stats = dailyData.data.map(day => ({
                date: day.date,
                profit_percent: day.rel_profit * 100, // Chuyển thành phần trăm
                net_profit: day.abs_profit,
                winrate: 0, // Không có thông tin này trong dữ liệu tổng hợp
                total_win: 0, // Không có thông tin này trong dữ liệu tổng hợp
                trades_count: day.trade_count,
                // Thêm chi tiết từ các bot nếu có
                bots_detail: day.bots_detail || []
            }));
        } else {
            // Nếu không phải view tổng hợp, xử lý như logic cũ
            daily_stats = allDates.map(date => {
                const dateStr = date.toISOString().split('T')[0];

                // Lấy toàn bộ giao dịch của bot trong ngày đang lặp đến
                const tradesOnDate = botTrades.filter(trade => {
                    if (!trade.close_date) return false; // Nếu ngày lặp đến chưa đóng thì return
                    
                    // Chuyển thời gian đóng lệnh sang string
                    const tradeDate = new Date(trade.close_date).toISOString().split('T')[0];

                    // Điều kiện lọc ra cách lệnh là bằng với ngày đang lọc trên allDates.map(date)
                    return tradeDate === dateStr;
                });

                // Tính tổng lợi nhuận trong ngày
                const total_dailyProfit = tradesOnDate.reduce((sum, trade) => sum + trade.realized_profit, 0);
                
                // Tính tổng số vốn bỏ ra trong ngày
                const totalStake = tradesOnDate.reduce((sum, trade) => sum + trade.stake_amount, 0);
                
                // Tính tỷ lệ lợi nhuận dựa trên số vốn bỏ ra
                const total_dailyProfitPercent = totalStake > 0 
                    ? (total_dailyProfit / totalStake) * 100 
                    : 0;

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
        }

        // Tạo weekly_stats từ daily_stats bằng cách gộp dữ liệu theo tuần
        const weekly_stats = weeklyData && weeklyData.data ? weeklyData.data.map(week => {
            // Lấy ngày bắt đầu và kết thúc của tuần
            const weekDate = new Date(week.date);
            const weekStart = new Date(weekDate);
            const weekEnd = new Date(weekDate);
            weekEnd.setDate(weekEnd.getDate() + 6); // Thêm 6 ngày để có tuần đầy đủ

            // Chuẩn hóa ngày bắt đầu và kết thúc để chỉ xét phần ngày (không quan tâm đến giờ)
            weekStart.setHours(0, 0, 0, 0);
            weekEnd.setHours(23, 59, 59, 999);

            // Lọc các giao dịch của bot hiện tại trong tuần này
            const tradesInWeek = botTrades.filter(trade => {
                if (!trade.close_date) return false;
                
                // Chuyển chuỗi ngày thành đối tượng Date một cách an toàn
                const tradeDate = new Date(trade.close_date.replace(" ", "T") + "Z");
                
                // Chuẩn hóa ngày giao dịch để chỉ xét phần ngày
                const tradeDateOnly = new Date(tradeDate);
                tradeDateOnly.setHours(0, 0, 0, 0);
                
                return tradeDateOnly >= weekStart && tradeDateOnly <= weekEnd;
            });

            // Tính toán lợi nhuận thực tế của bot trong tuần
            const weeklyProfit = tradesInWeek.reduce((sum, trade) => sum + trade.realized_profit, 0);

            // Tính tổng số vống bỏ ra
            const stakeAmount = tradesInWeek.reduce((sum, trade) => sum + trade.stake_amount, 0);

            // Tính tỷ lệ lợi nhuận dựa trên số giao dịch thực tế
            const profitPercent = stakeAmount > 0
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
        }) : [];
        
        // Tạo monthly_stats từ daily_stats bằng cách gộp dữ liệu theo tháng
        const monthly_stats = monthlyData && monthlyData.data ? monthlyData.data.map(month => {
            // Lấy ngày bắt đầu và kết thúc của tháng
            const monthDate = new Date(month.date);
            const monthStart = new Date(monthDate);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0); // Lấy ngày cuối cùng của tháng

            // Lọc các giao dịch của bot hiện tại trong tháng này
            const tradesInMonth = botTrades.filter(trade => {
                if (!trade.close_date) return false;
                
                // Chuyển chuỗi ngày thành đối tượng Date một cách an toàn
                const tradeDate = new Date(trade.close_date.replace(" ", "T") + "Z");
                
                // Chuẩn hóa ngày giao dịch để so sánh chỉ phần ngày
                const tradeDateOnly = new Date(tradeDate);
                tradeDateOnly.setHours(0, 0, 0, 0);
                
                return tradeDateOnly >= monthStart && tradeDateOnly <= monthEnd;
            });

            // Tính toán lợi nhuận thực tế của bot trong tháng
            const monthlyProfit = tradesInMonth.reduce((sum, trade) => sum + trade.realized_profit, 0);

            // Tính tổng số vốn bỏ ra
            const stakeAmount = tradesInMonth.reduce((sum, trade) => sum + trade.stake_amount, 0);

            // Tính tỷ lệ lợi nhuận dựa trên số giao dịch thực tế
            const profitPercent = stakeAmount > 0
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
        }) : [];

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
            trades_count: botTrades.length,
            botId: botName,
        };
    });

    return botsData;
}

/**
 * Lấy thông tin thống kê tổng hợp theo tất cả các ngày
 */
function getAllDailyStats() {
    const bots = transformTradeData();
    
    // Tạo dữ liệu thống kê tổng hợp theo ngày từ tất cả các bot
    const result = {};

    bots.forEach(bot => {
        bot.daily_stats.forEach(dailyStat => {
            const { date } = dailyStat;
            
            if (!result[date]) {
                result[date] = {
                    date,
                    net_profit: 0,
                    profit_percent: 0,
                    trades_count: 0,
                    total_win: 0,
                    bots_data: []
                };
            }
            
            result[date].net_profit += dailyStat.net_profit;
            result[date].trades_count += dailyStat.trades_count;
            result[date].total_win += dailyStat.total_win;
            
            // Thêm dữ liệu của bot vào ngày
            result[date].bots_data.push({
                bot_name: bot.name,
                net_profit: dailyStat.net_profit,
                profit_percent: dailyStat.profit_percent,
                trades_count: dailyStat.trades_count,
                total_win: dailyStat.total_win,
                winrate: dailyStat.winrate
            });
        });
    });

    // Chuyển đổi từ object sang mảng và tính lại tỷ lệ lợi nhuận dựa trên tổng
    const dailyStats = Object.values(result)
        .map(day => {
            // Tính toán tỷ lệ thắng tổng
            const winrate = day.trades_count > 0 
                ? (day.total_win / day.trades_count) * 100 
                : 0;
                
            return {
                ...day,
                winrate
            };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return dailyStats;
}

/**
 * Lấy thông tin thống kê tổng hợp theo tất cả các tuần
 */
function getAllWeeklyStats() {
    const bots = transformTradeData();
    
    // Tạo dữ liệu thống kê tổng hợp theo tuần từ tất cả các bot
    const result = {};

    bots.forEach(bot => {
        bot.weekly_stats.forEach(weeklyStat => {
            const { date } = weeklyStat;
            
            if (!result[date]) {
                result[date] = {
                    date,
                    net_profit: 0,
                    profit_percent: 0,
                    trades_count: 0,
                    win_count: 0,
                    bots_data: []
                };
            }
            
            result[date].net_profit += weeklyStat.net_profit;
            result[date].trades_count += weeklyStat.trades_count;
            result[date].win_count += weeklyStat.win_count;
            
            // Thêm dữ liệu của bot vào tuần
            result[date].bots_data.push({
                bot_name: bot.name,
                net_profit: weeklyStat.net_profit,
                profit_percent: weeklyStat.profit_percent,
                trades_count: weeklyStat.trades_count,
                win_count: weeklyStat.win_count,
                winrate: weeklyStat.winrate
            });
        });
    });

    // Chuyển đổi từ object sang mảng và tính lại tỷ lệ lợi nhuận dựa trên tổng
    const weeklyStats = Object.values(result)
        .map(week => {
            // Tính toán tỷ lệ thắng tổng
            const winrate = week.trades_count > 0 
                ? (week.win_count / week.trades_count) * 100 
                : 0;
                
            return {
                ...week,
                winrate
            };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return weeklyStats;
}

/**
 * Lấy thông tin thống kê tổng hợp theo tất cả các tháng
 */
function getAllMonthlyStats() {
    const bots = transformTradeData();
    
    // Tạo dữ liệu thống kê tổng hợp theo tháng từ tất cả các bot
    const result = {};

    bots.forEach(bot => {
        bot.monthly_stats.forEach(monthlyStat => {
            const { date } = monthlyStat;
            
            if (!result[date]) {
                result[date] = {
                    date,
                    net_profit: 0,
                    profit_percent: 0,
                    trades_count: 0,
                    win_count: 0,
                    bots_data: []
                };
            }
            
            result[date].net_profit += monthlyStat.net_profit;
            result[date].trades_count += monthlyStat.trades_count;
            result[date].win_count += monthlyStat.win_count;
            
            // Thêm dữ liệu của bot vào tháng
            result[date].bots_data.push({
                bot_name: bot.name,
                net_profit: monthlyStat.net_profit,
                profit_percent: monthlyStat.profit_percent,
                trades_count: monthlyStat.trades_count,
                win_count: monthlyStat.win_count,
                winrate: monthlyStat.winrate
            });
        });
    });

    // Chuyển đổi từ object sang mảng và tính lại tỷ lệ lợi nhuận dựa trên tổng
    const monthlyStats = Object.values(result)
        .map(month => {
            // Tính toán tỷ lệ thắng tổng
            const winrate = month.trades_count > 0 
                ? (month.win_count / month.trades_count) * 100 
                : 0;
                
            return {
                ...month,
                winrate
            };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return monthlyStats;
}

/**
 * Lấy thông tin thống kê theo ngày cụ thể - giống như trong frontend
 * @param {string|Date} date - Ngày cần lấy thống kê
 * @returns {Array} Mảng dữ liệu thống kê theo ngày
 */
function getDailyStats(date) {
    if (!date) {
        return getAllDailyStats();
    }

    const bots = transformTradeData();
    if (!bots || bots.length === 0) return [];

    // Đảm bảo date là object Date
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    const dateStr = dateObj.toISOString().split('T')[0];

    return bots.map(bot => {
        const dailyStat = bot.daily_stats.find(stat =>
            new Date(stat.date).toISOString().split('T')[0] === dateStr
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
}

/**
 * Lấy thông tin thống kê theo tuần kết thúc vào một ngày cụ thể - giống như trong frontend
 * @param {string|Date} endDate - Ngày kết thúc tuần cần lấy thống kê
 * @returns {Array} Mảng dữ liệu thống kê theo tuần
 */
function getWeeklyStats(endDate) {
    if (!endDate) {
        return getAllWeeklyStats();
    }

    const bots = transformTradeData();
    if (!bots || bots.length === 0) return [];

    // Đảm bảo endDate là object Date
    const endDateObj = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate);
    
    // Tìm ngày đầu tuần (cách 7 ngày)
    const startDate = new Date(endDateObj);
    startDate.setDate(endDateObj.getDate() - 6);

    return bots.map(bot => {
        // Lấy từ weekly_stats nếu có
        const weeklyStat = bot.weekly_stats.find(stat => {
            const statDate = new Date(stat.date);
            return statDate >= startDate && statDate <= endDateObj;
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
}

/**
 * Lấy thông tin thống kê theo tháng cụ thể - giống như trong frontend
 * @param {string|Date} date - Tháng cần lấy thống kê
 * @returns {Array} Mảng dữ liệu thống kê theo tháng
 */
function getMonthlyStats(date) {
    if (!date) {
        return getAllMonthlyStats();
    }

    const bots = transformTradeData();
    if (!bots || bots.length === 0) return [];

    // Đảm bảo date là object Date
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    
    // Tính ngày đầu tháng và cuối tháng
    const startDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    const endDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
    
    // Format tháng-năm để so sánh
    const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

    return bots.map(bot => {
        // Lấy từ monthly_stats nếu có
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
}

/**
 * Lấy thông tin metadata cho API, bao gồm ngày giao dịch đầu tiên và mới nhất
 */
function getMetadata() {
    const profitData = getLocalProfitData();
    
    if (!profitData) {
        return null;
    }
    
    return {
        latest_trade_date: profitData.latest_trade_date,
        first_trade_date: profitData.first_trade_date,
        total_trades: profitData.trade_count
    };
}

/**
 * Lấy thông tin chi tiết của một bot cụ thể
 * @param {string} botName - Tên của bot cần lấy thông tin
 * @returns {Object|null} Thông tin chi tiết của bot hoặc null nếu không tìm thấy
 */
function getBotDetails(botName) {
    const botsData = transformTradeData();
    
    if (!botsData || !Array.isArray(botsData)) {
        return null;
    }
    
    const botData = botsData.find(bot => bot.name === botName);
    return botData || null;
}

module.exports = {
    transformTradeData,
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    getAllDailyStats,
    getAllWeeklyStats,
    getAllMonthlyStats,
    getMetadata,
    getBotDetails
}; 