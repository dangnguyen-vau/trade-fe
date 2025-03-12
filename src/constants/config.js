/**
 * Cấu hình chung cho ứng dụng
 */

/**
 * Cấu hình cho biểu đồ
 * @const {Object}
 */
export const CHART_CONFIG = {
  /** Chiều cao mặc định của biểu đồ */
  DEFAULT_HEIGHT: 300,
  /** Màu sắc mặc định cho dữ liệu dương */
  POSITIVE_COLOR: '#10b981',
  /** Màu sắc mặc định cho dữ liệu âm */
  NEGATIVE_COLOR: '#ef4444',
  /** Bật/tắt animation cho biểu đồ */
  ENABLE_ANIMATION: true,
  /** Thời gian animation (ms) */
  ANIMATION_DURATION: 500
};

/**
 * Cấu hình cho bảng
 * @const {Object}
 */
export const TABLE_CONFIG = {
  /** Số hàng mặc định trên mỗi trang */
  ROWS_PER_PAGE: 10,
  /** Tùy chọn số hàng trên mỗi trang */
  ROWS_PER_PAGE_OPTIONS: [5, 10, 25, 50, 100],
  /** Bật/tắt phân trang */
  ENABLE_PAGINATION: true
};

/**
 * Cấu hình cho số liệu
 * @const {Object}
 */
export const NUMBER_FORMAT = {
  /** Số chữ số thập phân cho số lợi nhuận */
  PROFIT_DECIMALS: 2,
  /** Số chữ số thập phân cho tỷ lệ phần trăm */
  PERCENT_DECIMALS: 1,
  /** Locale cho định dạng số */
  LOCALE: 'vi-VN'
};
