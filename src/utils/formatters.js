// src/utils/formatters.js
// Pure utility functions — no side effects, easy to test.
// All money formatting goes here so it's consistent across the whole app.

/**
 * Format a number as Bangladeshi Taka
 * Example: formatCurrency(1500) → "৳1,500"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '৳0';
  return `৳${Number(amount).toLocaleString('en-BD')}`;
};

/**
 * Format a date to readable Bangladeshi format
 * Example: formatDate("2024-01-15") → "15 Jan 2024"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a date to show just the time
 * Example: formatTime("2024-01-15T14:30:00") → "2:30 PM"
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date for display in lists
 * Returns "Today", "Yesterday", or the date
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return formatDate(dateString);
};