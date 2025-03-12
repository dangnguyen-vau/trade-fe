import React, { useState, useMemo, useCallback } from 'react';
import './Dashboard.css';
import TopBar from '../../components/layout/TopBar';
import ProfitChart from '../../components/features/Dashboard/ProfitChart';
import BotCard from '../../components/features/Dashboard/BotCard';
import StatsSummary from '../../components/features/Dashboard/StatsSummary';
import WeeklyStatsSummary from '../../components/features/Dashboard/WeeklyStatsSummary';
import QuickOverview from '../../components/features/Dashboard/QuickOverview';
import { botsData } from '../../mocks/botsData';

function Dashboard() {
  // Lưu ý: Bạn cần di chuyển logic từ App.js vào đây
  
  return (
    <div className="dashboard">
      <TopBar />
      <div className="dashboard-content">
        <QuickOverview />
        <div className="charts-container">
          <ProfitChart />
        </div>
        <StatsSummary />
        <WeeklyStatsSummary />
        <div className="bots-grid">
          {/* Map qua botsData để hiển thị BotCard */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
