const express = require('express');
const router = express.Router();
const { getLocalTradesData } = require('./services/tradeService');
const { getLocalBalanceData } = require('./services/balanceService');
const { getLocalProfitData } = require('./services/profitService');
const { getLocalDailyData } = require('./services/TimeOver/dailyService');
const { getLocalWeeklyData } = require('./services/TimeOver/weeklyService');
const { getLocalMonthlyData } = require('./services/TimeOver/monthlyService');

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



module.exports = router;