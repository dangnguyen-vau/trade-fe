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
    try {
        console.log('Bắt đầu transformTradeData()');
        
        // Lấy dữ liệu từ các nguồn
        const tradesData = getLocalTradesData() || { trades: [] };
        const balanceData = getLocalBalanceData() || { total: 0, starting_capital: 0 };
        const profitData = getLocalProfitData() || { first_trade_date: null, latest_trade_date: null };
        const dailyData = getLocalDailyData() || { data: [] };
        const weeklyData = getLocalWeeklyData() || { data: [] };
        const monthlyData = getLocalMonthlyData() || { data: [] };

        // Log thông tin debug
        console.log(`Số lượng giao dịch: ${tradesData?.trades?.length || 0}`);
        console.log(`Số lượng dữ liệu daily: ${dailyData?.data?.length || 0}`);
        console.log(`Số lượng dữ liệu weekly: ${weeklyData?.data?.length || 0}`);
        console.log(`Số lượng dữ liệu monthly: ${monthlyData?.data?.length || 0}`);
        
        // Kiểm tra toàn diện dữ liệu đầu vào
        if (!tradesData || !tradesData.trades || !Array.isArray(tradesData.trades) || tradesData.trades.length === 0) {
            console.warn('Thiếu dữ liệu giao dịch hoặc định dạng không hợp lệ');
            // Trả về mảng rỗng thay vì dừng hàm
            return [];
        }
        
        // Lấy danh sách tất cả các bot duy nhất từ trades
        // Sử dụng botId nếu có, nếu không thì dùng strategy như trước
        const botNames = [...new Set(tradesData.trades
            .filter(trade => trade && (trade.botId || trade.strategy)) // Đảm bảo trade và thuộc tính tồn tại
            .map(trade => trade.botId || trade.strategy))];
        
        console.log(`Tìm thấy ${botNames.length} bot: ${botNames.join(', ')}`);
        
        if (botNames.length === 0) {
            console.warn('Không tìm thấy bot nào từ dữ liệu giao dịch');
            return [];
        }

        // Đảm bảo có ngày bắt đầu và kết thúc hợp lệ
        // Nếu không có, sử dụng ngày hiện tại và 30 ngày trước đó
        const startDate = profitData.first_trade_date 
            ? new Date(profitData.first_trade_date) 
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 ngày trước
            
        const endDate = profitData.latest_trade_date 
            ? new Date(profitData.latest_trade_date) 
            : new Date(); // Ngày hiện tại
        
        console.log(`Khoảng thời gian xử lý: ${startDate.toISOString()} đến ${endDate.toISOString()}`);

        // Tạo cấu trúc dữ liệu bot
        const botsData = botNames.map(botName => {
            try {
                // Tất cả giao dịch của 1 bot, ưu tiên dùng botId trước, nếu không có thì dùng strategy
                const botTrades = tradesData.trades.filter(trade => 
                    (trade && trade.botId && trade.botId === botName) || 
                    (trade && !trade.botId && trade.strategy === botName)
                );

                if (botTrades.length === 0) {
                    console.warn(`Không tìm thấy giao dịch nào cho bot ${botName}`);
                    return null; // Bỏ qua bot này
                }

                console.log(`Bot ${botName}: ${botTrades.length} giao dịch`);

                // Tính tổng lợi nhuận và số giao dịch thắng/thua
                const totalProfit = botTrades.reduce((sum, trade) => sum + (trade.realized_profit || 0), 0);
                const winningTrades = botTrades.filter(trade => (trade.profit_pct || trade.profit_ratio * 100) > 0).length;
                const winRate = botTrades.length > 0 ? (winningTrades / botTrades.length) * 100 : 0;

                // Tạo mảng chứa tất cả các ngày trong khoảng
                const allDates = [];
                const currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    allDates.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Tạo dữ liệu daily_stats
                let daily_stats = [];
                
                if (useConsolidated && dailyData && dailyData.data && dailyData.data.length > 0) {
                    // Sử dụng dữ liệu tổng hợp từ tất cả các bot nếu là view tổng hợp
                    daily_stats = dailyData.data.map(day => ({
                        date: day.date,
                        profit_percent: day.rel_profit * 100, // Chuyển thành phần trăm
                        net_profit: day.abs_profit || 0,
                        winrate: day.winrate || 0, 
                        total_win: day.win_count || 0, 
                        trades_count: day.trade_count || 0,
                        // Thêm chi tiết từ các bot nếu có
                        bots_detail: day.bots_detail || []
                    }));
                } else {
                    // Nếu không phải view tổng hợp, xử lý như logic cũ
                    daily_stats = allDates.map(date => {
                        try {
                            const dateStr = date.toISOString().split('T')[0];

                            // Lấy toàn bộ giao dịch của bot trong ngày đang lặp đến
                            const tradesOnDate = botTrades.filter(trade => {
                                try {
                                    if (!trade || !trade.close_date) return false; // Nếu ngày lặp đến chưa đóng thì return
                                    
                                    // Chuyển thời gian đóng lệnh sang string
                                    const tradeDate = new Date(trade.close_date).toISOString().split('T')[0];

                                    // Điều kiện lọc ra cách lệnh là bằng với ngày đang lọc trên allDates.map(date)
                                    return tradeDate === dateStr;
                                } catch (innerError) {
                                    console.error(`Lỗi khi lọc giao dịch theo ngày ${dateStr}:`, innerError.message);
                                    return false;
                                }
                            });

                            // Tính tổng lợi nhuận trong ngày
                            const total_dailyProfit = tradesOnDate.reduce((sum, trade) => sum + (trade.realized_profit || 0), 0);
                            
                            // Kiểm tra xem có dữ liệu daily_combined.json không
                            let total_dailyProfitPercent = 0;
                            try {
                                // Lấy dữ liệu từ daily_combined.json
                                const dailyDataForDate = dailyData?.data?.find(d => d.date === dateStr);
                                
                                if (dailyDataForDate && dailyDataForDate.bots_detail) {
                                    // Tìm thông tin của bot hiện tại trong ngày đang xét
                                    const botDetail = dailyDataForDate.bots_detail.find(b => b.botId === botName);
                                    
                                    if (botDetail && botDetail.rel_profit) {
                                        // Nếu tìm thấy, sử dụng rel_profit từ file daily_combined.json và chuyển đổi thành phần trăm
                                        total_dailyProfitPercent = botDetail.rel_profit * 100;
                                    } else {
                                       console.warn('Không thấy dữ liệu relprofit của bot');
                                    }
                                } else {
                                   console.warn('không tìm thấy dữ liệu cho ngày đó');
                                }
                            } catch (error) {
                                console.error('Đã xảy ra lỗi: ', error);
                            }

                            // Tính win rate trong ngày
                            const dailyWinningTrades = tradesOnDate.filter(trade => (trade.profit_pct || (trade.profit_ratio || 0) * 100) > 0).length;
                            const dailyWinRate = tradesOnDate.length > 0 ? (dailyWinningTrades / tradesOnDate.length) * 100 : 0;

                            return {
                                date: dateStr,
                                profit_percent: total_dailyProfitPercent,
                                net_profit: total_dailyProfit,
                                winrate: dailyWinRate,
                                total_win: dailyWinningTrades,
                                trades_count: tradesOnDate.length,
                            };
                        } catch (dateError) {
                            console.error(`Lỗi khi xử lý dữ liệu ngày ${date.toISOString()}:`, dateError.message);
                            return {
                                date: date.toISOString().split('T')[0],
                                profit_percent: 0,
                                net_profit: 0,
                                winrate: 0,
                                total_win: 0,
                                trades_count: 0,
                            };
                        }
                    });
                }

                // Tạo weekly_stats từ daily_stats bằng cách gộp dữ liệu theo tuần
                const weekly_stats = weeklyData && weeklyData.data ? weeklyData.data.map(week => {
                    try {
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
                            try {
                                if (!trade || !trade.close_date) return false;
                                
                                // Chuyển chuỗi ngày thành đối tượng Date một cách an toàn
                                const tradeDate = new Date(trade.close_date.replace(" ", "T") + "Z");
                                
                                // Chuẩn hóa ngày giao dịch để chỉ xét phần ngày
                                const tradeDateOnly = new Date(tradeDate);
                                tradeDateOnly.setHours(0, 0, 0, 0);
                                
                                return tradeDateOnly >= weekStart && tradeDateOnly <= weekEnd;
                            } catch (innerError) {
                                console.error(`Lỗi khi lọc giao dịch theo tuần:`, innerError.message);
                                return false;
                            }
                        });

                        // Tính toán lợi nhuận thực tế của bot trong tuần
                        const weeklyProfit = tradesInWeek.reduce((sum, trade) => sum + (trade.realized_profit || 0), 0);

                        // Lấy dữ liệu profit_percent từ weeklyData nếu có
                        let profitPercent = 0;
                        try {
                            // Tìm dữ liệu tuần tương ứng
                            const weeklyDataForDate = week;
                            
                            if (weeklyDataForDate && weeklyDataForDate.bots_detail) {
                                // Tìm thông tin của bot hiện tại trong tuần đang xét
                                const botDetail = weeklyDataForDate.bots_detail.find(b => b.botId === botName);
                                
                                if (botDetail && botDetail.rel_profit !== undefined) {
                                    // Nếu tìm thấy, sử dụng rel_profit từ file weekly_combined.json và chuyển đổi thành phần trăm
                                    profitPercent = botDetail.rel_profit * 100;
                                } else {
                                    console.warn("không tìm thấy thông tin bot");
                                }
                            } else {
                                console.warn('không tìm thấy thông tin bot');
                            }
                        } catch (error) {
                            console.error(`Lỗi khi lấy dữ liệu rel_profit từ weekly_combined.json: ${error.message}`);
                        }

                        // Tính win rate trong tuần
                        const winningTrades = tradesInWeek.filter(trade => (trade.realized_profit || 0) > 0).length;
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
                    } catch (weekError) {
                        console.error(`Lỗi khi xử lý dữ liệu tuần:`, weekError.message);
                        return {
                            date: new Date(week.date).toISOString().split('T')[0],
                            trades_count: 0,
                            net_profit: 0,
                            profit_percent: 0,
                            win_count: 0,
                            winrate: 0,
                        };
                    }
                }) : [];
                
                // Tạo monthly_stats từ daily_stats bằng cách gộp dữ liệu theo tháng
                const monthly_stats = monthlyData && monthlyData.data ? monthlyData.data.map(month => {
                    try {
                        // Lấy ngày bắt đầu và kết thúc của tháng
                        const monthDate = new Date(month.date);
                        const monthStart = new Date(monthDate);
                        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0); // Lấy ngày cuối cùng của tháng

                        // Lọc các giao dịch của bot hiện tại trong tháng này
                        const tradesInMonth = botTrades.filter(trade => {
                            try {
                                if (!trade || !trade.close_date) return false;
                                
                                // Chuyển chuỗi ngày thành đối tượng Date một cách an toàn
                                const tradeDate = new Date(trade.close_date.replace(" ", "T") + "Z");
                                
                                // Chuẩn hóa ngày giao dịch để so sánh chỉ phần ngày
                                const tradeDateOnly = new Date(tradeDate);
                                tradeDateOnly.setHours(0, 0, 0, 0);
                                
                                return tradeDateOnly >= monthStart && tradeDateOnly <= monthEnd;
                            } catch (innerError) {
                                console.error(`Lỗi khi lọc giao dịch theo tháng:`, innerError.message);
                                return false;
                            }
                        });

                        // Tính toán lợi nhuận thực tế của bot trong tháng
                        const monthlyProfit = tradesInMonth.reduce((sum, trade) => sum + (trade.realized_profit || 0), 0);

                        // Lấy dữ liệu profit_percent từ monthlyData nếu có
                        let profitPercent = 0;
                        try {
                            // Tìm dữ liệu tháng tương ứng
                            const monthlyDataForDate = month;
                            
                            if (monthlyDataForDate && monthlyDataForDate.bots_detail) {
                                // Tìm thông tin của bot hiện tại trong tháng đang xét
                                const botDetail = monthlyDataForDate.bots_detail.find(b => b.botId === botName);
                                
                                if (botDetail && botDetail.rel_profit !== undefined) {
                                    // Nếu tìm thấy, sử dụng rel_profit từ file monthly_combined.json và chuyển đổi thành phần trăm
                                    profitPercent = botDetail.rel_profit * 100;
                                } else {
                                    console.warn('không tìm thấy thông tin bot');
                                }
                            } else {
                                console.warn('không tìm thấy dữ liệu cho tháng đó');
                            }
                        } catch (error) {
                            console.error(`Lỗi khi lấy dữ liệu rel_profit từ monthly_combined.json: ${error.message}`);
                        }

                        // Tính win rate trong tháng
                        const winningTrades = tradesInMonth.filter(trade => (trade.realized_profit || 0) > 0).length;
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
                    } catch (monthError) {
                        console.error(`Lỗi khi xử lý dữ liệu tháng:`, monthError.message);
                        return {
                            date: new Date(month.date).toISOString().split('T')[0],
                            trades_count: 0,
                            net_profit: 0,
                            profit_percent: 0,
                            win_count: 0,
                            winrate: 0,
                        };
                    }
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
                    daily_stats: daily_stats || [],
                    weekly_stats: weekly_stats || [],
                    monthly_stats: monthly_stats || [],
                    current_balance: currentBalance,
                    total_profit: totalProfit,
                    win_rate: winRate.toFixed(2),
                    trades_count: botTrades.length,
                    botId: botName,
                };
            } catch (botError) {
                console.error(`Lỗi khi xử lý dữ liệu cho bot ${botName}:`, botError.message);
                return null; // Bỏ qua bot này nếu xử lý lỗi
            }
        }).filter(bot => bot !== null); // Lọc bỏ các bot bị null do lỗi

        console.log(`Hoàn thành transformTradeData(): ${botsData.length} bot được xử lý`);
        return botsData;
    } catch (error) {
        console.error('Lỗi nghiêm trọng trong transformTradeData():', error);
        // Trả về mảng trống để không làm crash ứng dụng
        return [];
    }
}

/**
 * Lấy thông tin thống kê tổng hợp theo tất cả các ngày
 */
function getAllDailyStats() {
    try {
        console.log('Bắt đầu getAllDailyStats()');
        
        const bots = transformTradeData();
        
        if (!bots || !Array.isArray(bots) || bots.length === 0) {
            console.warn('Không có dữ liệu bot trong getAllDailyStats');
            return [];
        }
        
        console.log(`Số lượng bot để tính daily stats: ${bots.length}`);
        
        // Tạo dữ liệu thống kê tổng hợp theo ngày từ tất cả các bot
        const result = {};

        bots.forEach((bot, index) => {
            if (!bot || !bot.daily_stats || !Array.isArray(bot.daily_stats)) {
                console.warn(`Bot #${index} (${bot?.name || 'unknown'}) không có daily_stats hợp lệ`);
                return; // continue trong forEach
            }
            
            bot.daily_stats.forEach(dailyStat => {
                try {
                    if (!dailyStat || !dailyStat.date) {
                        console.warn(`Bỏ qua daily stat không hợp lệ của bot ${bot.name}`);
                        return; // continue trong forEach
                    }
                    
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
                    
                    result[date].net_profit += dailyStat.net_profit || 0;
                    result[date].trades_count += dailyStat.trades_count || 0;
                    result[date].total_win += dailyStat.total_win || 0;
                    
                    // Thêm dữ liệu của bot vào ngày
                    result[date].bots_data.push({
                        bot_name: bot.name,
                        net_profit: dailyStat.net_profit || 0,
                        profit_percent: dailyStat.profit_percent || 0,
                        trades_count: dailyStat.trades_count || 0,
                        total_win: dailyStat.total_win || 0,
                        winrate: dailyStat.winrate || 0
                    });
                } catch (statError) {
                    console.error(`Lỗi khi xử lý daily stat cho bot ${bot.name}:`, statError);
                }
            });
        });
        
        // Số lượng ngày đã xử lý
        const daysCount = Object.keys(result).length;
        console.log(`Tổng số ngày đã xử lý: ${daysCount}`);
        
        if (daysCount === 0) {
            console.warn('Không có dữ liệu ngày nào được xử lý');
            return [];
        }

        // Chuyển đổi từ object sang mảng và tính lại tỷ lệ lợi nhuận dựa trên tổng
        const dailyStats = Object.values(result)
            .map(day => {
                try {
                    // Tính toán tỷ lệ thắng tổng
                    const winrate = day.trades_count > 0 
                        ? (day.total_win / day.trades_count) * 100 
                        : 0;
                        
                    return {
                        ...day,
                        winrate
                    };
                } catch (dayError) {
                    console.error(`Lỗi khi tính toán winrate cho ngày ${day.date}:`, dayError);
                    return {
                        ...day,
                        winrate: 0
                    };
                }
            })
            .sort((a, b) => {
                try {
                    return new Date(a.date) - new Date(b.date);
                } catch (sortError) {
                    console.error('Lỗi khi sắp xếp ngày:', sortError);
                    return 0;
                }
            });
        
        console.log(`Hoàn thành getAllDailyStats(): ${dailyStats.length} ngày dữ liệu`);
        return dailyStats;
    } catch (error) {
        console.error('Lỗi nghiêm trọng trong getAllDailyStats():', error);
        return [];
    }
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
        console.warn("Yêu cầu cần ngày cụ thể, thiếu ngày cụ thể trong getDailyStats");
    }

    // Khi lấy dữ liệu cho từng bot riêng biệt theo ngày, phải đặt useConsolidated = false
    // để đảm bảo mỗi bot có dữ liệu riêng thay vì dùng dữ liệu tổng hợp
    const bots = transformTradeData(false);
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
    try {
        if (!endDate) {
            console.warn("Yêu cầu cần ngày cụ thể trong getWeeklyStats");
            return [];
        }

        // Lấy dữ liệu weekly_combined
        const weeklyData = getLocalWeeklyData() || { data: [] };
        if (!weeklyData.data || !weeklyData.data.length) {
            console.warn("Không tìm thấy dữ liệu tuần trong weekly_combined.json");
            return [];
        }

        // Đảm bảo endDate là object Date
        const endDateObj = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate);
        const endDateStr = endDateObj.toISOString().split('T')[0];

        // Tìm tuần phù hợp trong dữ liệu
        const weeklyEntry = weeklyData.data.find(week => {
            // Ngày trong file weekly_combined.json là ngày bắt đầu của tuần
            const weekDate = new Date(week.date);
            const weekEndDate = new Date(weekDate);
            weekEndDate.setDate(weekDate.getDate() + 6);
            
            // Kiểm tra nếu endDate thuộc khoảng của tuần này
            return weekDate <= endDateObj && endDateObj <= weekEndDate;
        });

        if (!weeklyEntry) {
            console.warn(`Không tìm thấy dữ liệu tuần kết thúc vào ngày ${endDateStr} trong weekly_combined.json`);
            // Tìm tuần gần nhất để trả về
            const sortedWeeks = [...weeklyData.data].sort((a, b) => new Date(b.date) - new Date(a.date));
            const closestWeek = sortedWeeks.length > 0 ? sortedWeeks[0] : null;
            
            if (!closestWeek) return [];
            
            console.log(`Trả về dữ liệu tuần gần nhất: ${closestWeek.date}`);
            return formatWeeklyStats(closestWeek);
        }

        return formatWeeklyStats(weeklyEntry);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê theo tuần:", error);
        return [];
    }
}

/**
 * Format dữ liệu thống kê theo tuần để trả về cho frontend
 * @param {Object} weekEntry - Dữ liệu tuần từ weekly_combined.json
 * @returns {Array} Mảng dữ liệu thống kê theo tuần
 */
function formatWeeklyStats(weekEntry) {
    if (!weekEntry || !weekEntry.bots_detail) return [];
    
    return weekEntry.bots_detail.map(bot => ({
        name: bot.botName,
        performance: bot.rel_profit * 100, // Chuyển đổi thành phần trăm
        net_profit: bot.abs_profit || 0,
        winRate: "N/A", // Không có thông tin win rate trong weekly_combined.json
        trades: bot.trade_count || 0,
        win_count: 0, // Không có thông tin win count trong weekly_combined.json
        balance: {
            balance_starting: 0,
            balance_current: 0,
            balance_percent: 0
        }
    }));
}

/**
 * Lấy thông tin thống kê theo tháng cụ thể - giống như trong frontend
 * @param {string|Date} date - Tháng cần lấy thống kê
 * @returns {Array} Mảng dữ liệu thống kê theo tháng
 */
function getMonthlyStats(date) {
    try {
        if (!date) {
            console.warn("Yêu cầu cần tháng cụ thể trong getMonthlyStats");
            return [];
        }

        // Lấy dữ liệu monthly_combined
        const monthlyData = getLocalMonthlyData() || { data: [] };
        if (!monthlyData.data || !monthlyData.data.length) {
            console.warn("Không tìm thấy dữ liệu tháng trong monthly_combined.json");
            return [];
        }

        // Đảm bảo date là object Date
        const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
        
        // Format tháng-năm để so sánh
        const monthYearFormat = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        
        // Tìm tháng phù hợp trong dữ liệu
        const monthlyEntry = monthlyData.data.find(month => {
            const monthDate = new Date(month.date);
            const monthDateFormat = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
            return monthDateFormat === monthYearFormat;
        });

        if (!monthlyEntry) {
            console.warn(`Không tìm thấy dữ liệu tháng ${monthYearFormat} trong monthly_combined.json`);
            // Tìm tháng gần nhất để trả về
            const sortedMonths = [...monthlyData.data].sort((a, b) => new Date(b.date) - new Date(a.date));
            const closestMonth = sortedMonths.length > 0 ? sortedMonths[0] : null;
            
            if (!closestMonth) return [];
            
            console.log(`Trả về dữ liệu tháng gần nhất: ${closestMonth.date}`);
            return formatMonthlyStats(closestMonth);
        }

        return formatMonthlyStats(monthlyEntry);
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê theo tháng:", error);
        return [];
    }
}

/**
 * Format dữ liệu thống kê theo tháng để trả về cho frontend
 * @param {Object} monthEntry - Dữ liệu tháng từ monthly_combined.json
 * @returns {Array} Mảng dữ liệu thống kê theo tháng
 */
function formatMonthlyStats(monthEntry) {
    if (!monthEntry || !monthEntry.bots_detail) return [];
    
    return monthEntry.bots_detail.map(bot => ({
        name: bot.botName,
        performance: bot.rel_profit * 100, // Chuyển đổi thành phần trăm
        net_profit: bot.abs_profit || 0,
        winRate: "N/A", // Không có thông tin win rate trong monthly_combined.json
        trades: bot.trade_count || 0,
        win_count: 0, // Không có thông tin win count trong monthly_combined.json
        balance: {
            balance_starting: 0,
            balance_current: 0,
            balance_percent: 0
        }
    }));
}

/**
 * Lấy thông tin metadata cho API, bao gồm ngày giao dịch đầu tiên và mới nhất
 */
function getMetadata() {
    const profitData = getLocalProfitData();
    const dailyData = getLocalDailyData();
    const tradesData = getLocalTradesData();
    
    // Khởi tạo giá trị mặc định
    let metadata = {
        latest_trade_date: null,
        first_trade_date: null,
        total_trades: 0
    };
    
    // Cập nhật tổng số giao dịch từ tradesData nếu có
    if (tradesData && tradesData.trades && Array.isArray(tradesData.trades)) {
        metadata.total_trades = tradesData.trades.length;
    }
    
    // Lấy ngày đầu tiên và ngày cuối cùng từ dữ liệu daily tổng hợp
    if (dailyData && dailyData.data && dailyData.data.length > 0) {
        // Sắp xếp dữ liệu theo ngày tăng dần
        const sortedDailyData = [...dailyData.data].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (sortedDailyData.length > 0) {
            metadata.first_trade_date = sortedDailyData[0].date;
            metadata.latest_trade_date = sortedDailyData[sortedDailyData.length - 1].date;
        }
    }
    
    // Nếu không tìm thấy dữ liệu trong daily, thử sử dụng profitData (cách cũ)
    if (!metadata.first_trade_date || !metadata.latest_trade_date) {
        if (profitData && profitData.first_trade_date && profitData.latest_trade_date) {
            metadata.first_trade_date = profitData.first_trade_date;
            metadata.latest_trade_date = profitData.latest_trade_date;
            
            if (profitData.trade_count && !metadata.total_trades) {
                metadata.total_trades = profitData.trade_count;
            }
        } else {
            // Nếu không có cả hai nguồn dữ liệu, sử dụng ngày hiện tại
            const today = new Date();
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            
            metadata.first_trade_date = lastMonth.toISOString().split('T')[0];
            metadata.latest_trade_date = today.toISOString().split('T')[0];
            
            console.warn('Không tìm thấy dữ liệu ngày bắt đầu và kết thúc, sử dụng giá trị mặc định');
        }
    }
    
    return metadata;
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

/**
 * Lấy thông tin chi tiết của một bot dựa trên tên file cấu hình
 * @param {string} filename Tên file cấu hình của bot
 * @returns {Object} Thông tin chi tiết của bot
 */
function getBotByFilename(filename) {
    try {
        if (!filename) {
            console.error('Tham số filename bị thiếu');
            return null;
        }

        // Lấy dữ liệu bot từ hàm transformTradeData
        const botsData = transformTradeData();
        
        if (!botsData || botsData.length === 0) {
            console.error('Không tìm thấy dữ liệu bot nào');
            return null;
        }

        // Tìm bot dựa trên filename
        // Giả sử filename tương ứng với botId hoặc name của bot
        const botData = botsData.find(bot => 
            (bot.botId && bot.botId.includes(filename)) || 
            (bot.name && bot.name.includes(filename))
        );

        if (!botData) {
            console.error(`Không tìm thấy bot với filename: ${filename}`);
            return null;
        }

        return botData;
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu bot theo filename ${filename}:`, error.message);
        return null;
    }
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
    getBotDetails,
    getBotByFilename
}; 