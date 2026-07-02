// src/utils/formatters.js

export const formatLKR = (amount = 0) => {
  return 'Rs. ' + Number(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-LK', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export const capitalize = (str = '') =>
  str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'paid': return '#22C55E';
    case 'partially_paid': return '#EAB308';
    case 'unpaid': return '#EF4444';
    default: return '#94A3B8';
  }
};

export const getDeliveryStatusColor = (status) => {
  switch (status) {
    case 'delivered': return '#22C55E';
    case 'completed': return '#3B82F6';
    case 'on_going': return '#EAB308';
    case 'pending': return '#94A3B8';
    default: return '#94A3B8';
  }
};
