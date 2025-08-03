import { format } from "date-fns";

/**
 * Converts 24-hour time string (HH:mm) to 12-hour format using date-fns
 * @param time24 - Time string in 24-hour format (e.g., "14:30")
 * @returns Time string in 12-hour format (e.g., "02:30 PM")
 */
export const formatTime12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  if (!hours || !minutes) return '';
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return format(date, 'hh:mm a');
};

/**
 * Formats a date using date-fns with a full date format
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., "Friday, December 25, 2024")
 */
export const formatFullDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE, MMMM d, yyyy');
};

/**
 * Formats a date using date-fns with a short date format
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., "Dec 25, 2024")
 */
export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PP');
};

/**
 * Formats a date using date-fns with a very long date format
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., "Friday, December 25th, 2024")
 */
export const formatLongDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'PPPP');
};