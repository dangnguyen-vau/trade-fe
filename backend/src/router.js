const express = require('express');
const router = express.Router();
const { getLocalTradesData } = require('./services/tradeService');
const { getLocalBalanceData } = require('./services/balanceService');
const { getLocalProfitData } = require('./services/profitService');
const { getLocalDailyData } = require('./services/TimeOver/dailyService');
const { getLocalWeeklyData } = require('./services/TimeOver/weeklyService');
const { getLocalMonthlyData } = require('./services/TimeOver/monthlyService');
const { calculateAggregatedStats } = require('./services/statsService');
const { 
    transformTradeData, 
    getDailyStats, 
    getWeeklyStats, 
    getMonthlyStats,
    getMetadata,
    getBotDetails
} = require('./services/botService');
const { getAllTradesData } = require('./services/tradeService');
const { getAllBotConfigs } = require('./services');
const { getAllDailyData } = require('./services/TimeOver/dailyService');

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

// Endpoint để lấy dữ liệu profit
router.get('/profit', (req, res) => {
    try {
        const tradesData = getLocalProfitData();

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

// Endpoint để lấy dữ liệu trades
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


// Endpoint để lấy dữ liệu trades
router.get('/daily', (req, res) => {
    try {
        const tradesData = getLocalDailyData();

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


// Endpoint để lấy dữ liệu trades
router.get('/week', (req, res) => {
    try {
        const tradesData = getLocalWeeklyData();

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


// Endpoint để lấy dữ liệu trades
router.get('/month', (req, res) => {
    try {
        const tradesData = getLocalMonthlyData();

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

// API MỚI: Lấy thông tin thống kê theo ngày (tất cả hoặc ngày cụ thể)
router.get('/api/stats/daily', (req, res) => {
    try {
        const { date } = req.query;
        let dailyStats;
        
        if (date) {
            // Nếu có date, lấy thống kê theo ngày cụ thể
            dailyStats = getDailyStats(new Date(date));
        } else {
            // Nếu không có date, lấy tất cả
            dailyStats = getAllDailyStats();
        }
        
        if (dailyStats && dailyStats.length > 0) {
            return res.json(dailyStats);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu thống kê theo ngày' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu thống kê theo ngày:', error.message);
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

// API MỚI: Lấy thông tin thống kê theo tuần (tất cả hoặc tuần kết thúc vào ngày cụ thể)
router.get('/api/stats/weekly', (req, res) => {
    try {
        const { endDate } = req.query;
        let weeklyStats;
        
        if (endDate) {
            // Nếu có endDate, lấy thống kê theo tuần kết thúc vào ngày cụ thể
            weeklyStats = getWeeklyStats(new Date(endDate));
        } else {
            // Nếu không có endDate, lấy tất cả
            weeklyStats = getAllWeeklyStats();
        }
        
        if (weeklyStats && weeklyStats.length > 0) {
            return res.json(weeklyStats);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu thống kê theo tuần' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu thống kê theo tuần:', error.message);
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

// API MỚI: Lấy thông tin chi tiết của một bot cụ thể
router.get('/api/bots/:botName', (req, res) => {
    try {
        const { botName } = req.params;
        
        if (!botName) {
            return res.status(400).json({ error: 'Thiếu tham số botName' });
        }
        
        const botData = getBotDetails(botName);
        
        if (botData) {
            return res.json(botData);
        } else {
            return res.status(404).json({ error: 'Không tìm thấy bot với tên đã chỉ định' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu bot:', error.message);
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

module.exports = router;