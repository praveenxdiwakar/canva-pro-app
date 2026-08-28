import { apiClient } from './client';

export const fetchRedeemTiers = (initData) => {
  return apiClient('/api/redeem', { initData, method: 'GET' });
};

export const redeemPoints = (initData, tierPoints) => {
  return apiClient('/api/redeem', {
    initData,
    method: 'POST',
    body: JSON.stringify({ tierPoints }),
  });
};