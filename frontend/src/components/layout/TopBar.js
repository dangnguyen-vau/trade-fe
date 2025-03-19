import React from 'react';
import './TopBar.css';

function TopBar() {
  return (
    <nav className="topbar">
      <div className="topbar-left">
        <h1 className="logo">
          <span className="logo-icon">⚡</span>
          Trade<span className="highlight">FE</span>
        </h1>
      </div>
      <div className="topbar-right">
        <div className="nav-links">
          <a href="#" className="nav-link active">
            <span className="nav-icon">📊 </span>
            Dashboard
          </a>
          <a href="#" className="nav-link">
            <span className="nav-icon">🤖</span>
            Bots
          </a>
          <a href="#" className="nav-link">
            <span className="nav-icon">📈</span>
            Markets
          </a>
          <a href="#" className="nav-link">
            <span className="nav-icon">⚙️</span>
            Settings
          </a>
        </div>
        <div className="user-section">
          <div className="network-status">
            <span className="status-dot online"></span>
            Mainnet
          </div>
          <button className="connect-wallet">
            Connect Wallet
          </button>
        </div>
      </div>
    </nav>
  );
}

export default TopBar; 