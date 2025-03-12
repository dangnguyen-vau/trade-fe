/**
 * Các đường dẫn trong ứng dụng
 * @readonly
 * @enum {string}
 */
export const ROUTES = {
  /** Trang chủ - Dashboard */
  HOME: '/',
  /** Trang phân tích chiến lược */
  STRATEGY: '/strategy',
  /** Trang chi tiết bot */
  BOT_DETAILS: '/bot/:id',
  /** Trang cài đặt */
  SETTINGS: '/settings',
  /** Trang hồ sơ người dùng */
  PROFILE: '/profile'
};

/**
 * Tên hiển thị cho các route
 * @readonly
 * @enum {string}
 */
export const ROUTE_NAMES = {
  [ROUTES.HOME]: 'Dashboard',
  [ROUTES.STRATEGY]: 'Phân tích chiến lược',
  [ROUTES.BOT_DETAILS]: 'Chi tiết Bot',
  [ROUTES.SETTINGS]: 'Cài đặt',
  [ROUTES.PROFILE]: 'Hồ sơ'
};
