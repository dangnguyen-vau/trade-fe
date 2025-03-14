import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StrategyAnalysis from './pages/StrategyAnalysis';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/strategy" element={<StrategyAnalysis />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
