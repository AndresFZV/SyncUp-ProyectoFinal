/**
 * FORMATTERS.JS - Formateo de datos
 */

export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (duration) => {
  if (!duration || isNaN(duration)) return 'N/A';
  
  const minutes = Math.floor(duration);
  const seconds = Math.round((duration - minutes) * 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('es-ES', defaultOptions);
};

export const formatNumber = (num) => {
  if (isNaN(num)) return '0';
  return num.toLocaleString('es-ES');
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export default {
  formatTime,
  formatDuration,
  formatDate,
  formatNumber,
  capitalizeFirst,
  truncateText,
};