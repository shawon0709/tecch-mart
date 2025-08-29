import dayjs from 'dayjs';

// Format date: 12 Aug 2025
export const formatDate = (dateString: string | Date): string => {
  return dayjs(dateString).format('DD MMM YYYY');
};

// Format time: 03:30 PM
export const formatTime = (dateString: string | Date): string => {
  return dayjs(dateString).format('hh:mm A');
};

// Format date and time: 12 Aug 2025 03:30 PM
export const formatDateTime = (dateString: string | Date): string => {
  return dayjs(dateString).format('DD MMM YYYY hh:mm A');
};

// Format for date picker display
export const formatDateTimeForPicker = (dateString: string | Date): string => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};

// Check if a date is valid
export const isValidDate = (dateString: string | Date): boolean => {
  return dayjs(dateString).isValid();
};