/**
 * Các khoảng thời gian để hiển thị dữ liệu
 * @readonly
 * @enum {string}
 */
export const TIME_RANGES = {
  /** Hiển thị dữ liệu của ngày hôm nay */
  TODAY: 'today',
  /** Hiển thị dữ liệu của 7 ngày gần nhất */
  WEEK: 'week',
  /** Hiển thị dữ liệu của 30 ngày gần nhất */
  MONTH: 'month',
  /** Hiển thị dữ liệu của 90 ngày gần nhất */
  QUARTER: 'quarter',
  /** Hiển thị dữ liệu của 365 ngày gần nhất */
  YEAR: 'year',
  /** Hiển thị dữ liệu tất cả thời gian */
  ALL: 'all'
};

/**
 * Label hiển thị cho khoảng thời gian
 * @readonly
 * @enum {string}
 */
export const TIME_RANGE_LABELS = {
  [TIME_RANGES.TODAY]: 'Hôm nay',
  [TIME_RANGES.WEEK]: '7 ngày',
  [TIME_RANGES.MONTH]: '30 ngày',
  [TIME_RANGES.QUARTER]: '90 ngày',
  [TIME_RANGES.YEAR]: '365 ngày',
  [TIME_RANGES.ALL]: 'Tất cả'
};

/**
 * Số ngày tương ứng với khoảng thời gian
 * @readonly
 * @enum {number}
 */
export const TIME_RANGE_DAYS = {
  [TIME_RANGES.TODAY]: 1,
  [TIME_RANGES.WEEK]: 7,
  [TIME_RANGES.MONTH]: 30,
  [TIME_RANGES.QUARTER]: 90,
  [TIME_RANGES.YEAR]: 365,
  [TIME_RANGES.ALL]: Infinity
};
