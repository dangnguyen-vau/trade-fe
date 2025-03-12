/**
 * Các endpoint của API
 * @readonly
 * @enum {string}
 */
export const API_ENDPOINTS = {
  /** Endpoint cho danh sách bot */
  BOTS: '/api/data',
  /** Endpoint cho lịch sử giao dịch */
  TRADES: '/api/trades',
  /** Endpoint cho các chiến lược trading */
  STRATEGIES: '/api/strategies'
};

/**
 * Base URL của API
 * @const {string}
 */
export const API_BASE_URL = 'http://localhost:3003';

/**
 * Timeout cho các request API (milliseconds)
 * @const {number}
 */
export const API_TIMEOUT = 30000;
