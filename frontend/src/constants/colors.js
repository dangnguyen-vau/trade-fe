// Màu sắc chung cho toàn bộ ứng dụng
export const COLORS = {
  bg: '#0f172a',
  card: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(148, 163, 184, 0.1)',
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    light: '#64748b'
  },
  status: {
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b'
  }
};

// Màu sắc cho các bot
export const BOT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Orange
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F97316', // Dark Orange
  '#14B8A6', // Teal
  '#A855F7', // Violet
];

// Helper functions
export const getBackgroundColor = (color) => `${color}20`; // 12% opacity
export const getHoverColor = (color) => `${color}40`; // 25% opacity 