import { format } from 'date-fns';

export const formatCurrency = (amount) => `Rs. ${Number(amount).toFixed(2)}`;

export const formatDate = (date) => format(new Date(date), 'MMM dd, yyyy');

export const formatTime = (date) => format(new Date(date), 'hh:mm a');

export const formatDateTime = (date) => format(new Date(date), 'MMM dd, yyyy hh:mm a');

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
