import { format } from 'date-fns';

type DateLike = string | number | Date;

export const formatCurrency = (amount: number | string | null | undefined) => `Rs. ${Number(amount ?? 0).toFixed(2)}`;

export const formatDate = (date: DateLike) => format(new Date(date), 'MMM dd, yyyy');

export const formatTime = (date: DateLike) => format(new Date(date), 'hh:mm a');

export const formatDateTime = (date: DateLike) => format(new Date(date), 'MMM dd, yyyy hh:mm a');

export const truncateText = (text: string | null | undefined, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text ?? '';
  return `${text.slice(0, maxLength)}...`;
};
