const express = require('express');
const router = express.Router();
const { getLocalTradesData } = require('./services/tradeService');
const { getLocalBalanceData } = require('./services/balanceService');
const { calculateAggregatedStats } = require('./services/statsService');
const { 
    transformTradeData, 
    getDailyStats, 
    getWeeklyStats, 
    getMonthlyStats,
    getMetadata,
    getBotByFilename,
} = require('./services/botService');

// Endpoint để lấy dữ liệu trades
router.get('/trades', (req, res) => {
    try {
        const tradesData = getLocalTradesData();

        if (tradesData) {
            return res.json(tradesData);
        } else {
            return res.status(404).json({ error: 'Dữ liệu chưa được tạo' });
        }
    } catch (error) {
        console.error('Lỗi khi đọc dữ liệu trades:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// Endpoint để lấy dữ liệu balance
router.get('/balance', (req, res) => {
    try {
        const tradesData = getLocalBalanceData();

        if (tradesData) {
            return res.json(tradesData);
        } else {
            return res.status(404).json({ error: 'Dữ liệu chưa được tạo' });
        }
    } catch (error) {
        console.error('Lỗi khi đọc dữ liệu trades:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// API MỚI: Lấy thông tin tổng hợp tất cả bot đã được xử lý
router.get('/api/bots', (req, res) => {
    try {
        const botsData = transformTradeData();
        
        if (botsData && botsData.length > 0) {
            return res.json(botsData);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu bot' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu bot:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// API MỚI: Lấy thông tin thống kê theo ngày cụ thể (cho frontend sử dụng)
router.get('/api/stats/daily/:date', (req, res) => {
    try {
        const { date } = req.params;
        
        if (!date) {
            return res.status(400).json({ error: 'Thiếu tham số date' });
        }
        
        const dailyStats = getDailyStats(new Date(date));
        
        if (dailyStats && dailyStats.length > 0) {
            return res.json(dailyStats);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu thống kê cho ngày đã chỉ định' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu thống kê theo ngày:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// API MỚI: Lấy thông tin thống kê theo tuần kết thúc vào ngày cụ thể (cho frontend sử dụng)
router.get('/api/stats/weekly/:endDate', (req, res) => {
    try {
        const { endDate } = req.params;
        
        if (!endDate) {
            return res.status(400).json({ error: 'Thiếu tham số endDate' });
        }
        
        const weeklyStats = getWeeklyStats(new Date(endDate));
        
        if (weeklyStats && weeklyStats.length > 0) {
            return res.json(weeklyStats);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu thống kê cho tuần đã chỉ định' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu thống kê theo tuần:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// API MỚI: Lấy thông tin thống kê theo tháng (tất cả hoặc tháng cụ thể)
router.get('/api/stats/monthly', (req, res) => {
    try {
        const { date } = req.query;
        let monthlyStats;
        
        if (date) {
            // Nếu có date, lấy thống kê theo tháng cụ thể
            monthlyStats = getMonthlyStats(new Date(date));
        } else {
            // Nếu không có date, lấy tất cả
            monthlyStats = getAllMonthlyStats();
        }
        
        if (monthlyStats && monthlyStats.length > 0) {
            return res.json(monthlyStats);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu thống kê theo tháng' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu thống kê theo tháng:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// API MỚI: Lấy thông tin thống kê theo tháng cụ thể (cho frontend sử dụng)
router.get('/api/stats/monthly/:date', (req, res) => {
    try {
        const { date } = req.params;
        
        if (!date) {
            return res.status(400).json({ error: 'Thiếu tham số date' });
        }
        
        const monthlyStats = getMonthlyStats(new Date(date));
        
        if (monthlyStats && monthlyStats.length > 0) {
            return res.json(monthlyStats);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu thống kê cho tháng đã chỉ định' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu thống kê theo tháng:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// API MỚI: Lấy thông tin metadata cho frontend
router.get('/api/metadata', (req, res) => {
    try {
        const metadata = getMetadata();
        
        if (metadata) {
            return res.json(metadata);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu metadata' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu metadata:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// API endpoint để lấy thống kê tổng hợp
router.get('/api/stats/aggregated', (req, res) => {
    try {
        const aggregatedStats = calculateAggregatedStats();
        
        if (!aggregatedStats) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu giao dịch' });
        }

        return res.json(aggregatedStats);
    } catch (error) {
        console.error('Lỗi khi tính toán thống kê tổng hợp:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// Thêm route mới để tổng hợp dữ liệu từ tất cả các bot
router.get('/api/aggregated-data', async (req, res) => {
  try {
    console.log('Đang tổng hợp dữ liệu từ tất cả các bot...');
    
    // Lấy và tổng hợp dữ liệu từ tất cả các bot
    const tradesData = await getAllTradesData();
    const dailyData = await getAllDailyData();
    
    // Trả về danh sách các bot và thông tin tổng hợp
    res.json({
      success: true,
      message: 'Đã tổng hợp dữ liệu thành công',
      data: {
        botCount: getAllBotConfigs().length,
        totalTradeCount: tradesData.trade_count,
        tradeDataPath: '/consolidated/all_trades.json',
        dailyDataPath: '/consolidated/TimeOver/daily_combined.json',
      }
    });
  } catch (error) {
    console.error('Lỗi khi tổng hợp dữ liệu:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tổng hợp dữ liệu' });
  }
});

// API mới: Lấy danh sách các tuần có sẵn trong dữ liệu
router.get('/api/stats/available-weeks', (req, res) => {
    try {
        const { getLocalWeeklyData } = require('./services/TimeOver/weeklyService');
        const weeklyData = getLocalWeeklyData();
        
        if (!weeklyData || !weeklyData.data) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu tuần' });
        }

        // Cấu trúc dữ liệu tuần để hiển thị trên frontend
        const availableWeeks = weeklyData.data.map(week => {
            const weekStart = new Date(week.date);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            return {
                key: week.date,
                startDate: weekStart.toISOString().split('T')[0],
                endDate: weekEnd.toISOString().split('T')[0],
                label: `${weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`,
                abs_profit: week.abs_profit,
                rel_profit: week.rel_profit,
                trade_count: week.trade_count
            };
        }).sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Sắp xếp từ mới đến cũ

        return res.json(availableWeeks);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tuần:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// API mới: Lấy danh sách các tháng có sẵn trong dữ liệu
router.get('/api/stats/available-months', (req, res) => {
    try {
        const { getLocalMonthlyData } = require('./services/TimeOver/monthlyService');
        const monthlyData = getLocalMonthlyData();
        
        if (!monthlyData || !monthlyData.data) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu tháng' });
        }

        // Cấu trúc dữ liệu tháng để hiển thị trên frontend
        const availableMonths = monthlyData.data.map(month => {
            const monthDate = new Date(month.date);
            
            // Tính ngày bắt đầu và kết thúc của tháng
            const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            
            return {
                key: month.date,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                label: monthDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
                abs_profit: month.abs_profit,
                rel_profit: month.rel_profit,
                trade_count: month.trade_count
            };
        }).sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Sắp xếp từ mới đến cũ

        return res.json(availableMonths);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tháng:', error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

// Thêm API mới cho getBotData trong frontend
router.get('/api/bots/file/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({ error: 'Thiếu tham số filename' });
        }
        
        const botData = getBotByFilename(filename);
        
        if (botData) {
            return res.json(botData);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy bot với filename đã chỉ định' });
        }
    } catch (error) {
        console.error(`Lỗi khi xử lý dữ liệu bot với filename ${req.params.filename}:`, error.message);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;