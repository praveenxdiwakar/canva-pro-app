import { apiClient } from './client';

export const fetchProList = (initData) => {
  return apiClient('/api/users/pro-list', { initData, method: 'GET' });
};

export const fetchLeaderboard = (initData) => {
  return apiClient('/api/users/leaderboard', { initData, method: 'GET' });
};