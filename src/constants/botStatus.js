/**
 * Enum cho trạng thái của bot trading
 * @readonly
 * @enum {string}
 */
export const BOT_STATUS = {
  /** Bot đang hoạt động */
  ACTIVE: 'active',
  /** Bot tạm dừng */
  PAUSED: 'paused',
  /** Bot đang gặp lỗi */
  ERROR: 'error',
  /** Bot đang chờ tín hiệu */
  WAITING: 'waiting',
  /** Bot đang trong quá trình bảo trì */
  MAINTENANCE: 'maintenance'
};

/**
 * Màu sắc tương ứng với trạng thái của bot
 * @readonly
 * @enum {string}
 */
export const BOT_STATUS_COLORS = {
  [BOT_STATUS.ACTIVE]: '#10b981', // Green
  [BOT_STATUS.PAUSED]: '#f59e0b', // Orange
  [BOT_STATUS.ERROR]: '#ef4444', // Red
  [BOT_STATUS.WAITING]: '#3B82F6', // Blue
  [BOT_STATUS.MAINTENANCE]: '#8B5CF6' // Purple
};

/**
 * Label hiển thị cho trạng thái của bot
 * @readonly
 * @enum {string}
 */
export const BOT_STATUS_LABELS = {
  [BOT_STATUS.ACTIVE]: 'Đang hoạt động',
  [BOT_STATUS.PAUSED]: 'Tạm dừng',
  [BOT_STATUS.ERROR]: 'Lỗi',
  [BOT_STATUS.WAITING]: 'Đang chờ',
  [BOT_STATUS.MAINTENANCE]: 'Bảo trì'
};
