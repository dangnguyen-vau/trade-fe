import React from 'react';
import './StrategyAnalysis.css';
import TopBar from '../../components/layout/TopBar';
import MultiStrategyBacktestResults from '../../components/features/BotStrategy/MultiStrategyBacktestResults';

function StrategyAnalysis() {
  return (
    <div className="strategy-analysis">
      <TopBar />
      <div className="strategy-content">
        <MultiStrategyBacktestResults />
      </div>
    </div>
  );
}

export default StrategyAnalysis;
