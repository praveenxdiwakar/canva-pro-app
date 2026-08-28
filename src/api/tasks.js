import { apiClient } from './client';

export const fetchTasks = (initData) => {
  return apiClient('/api/tasks', { initData, method: 'GET' });
};

export const completeTask = (initData, taskType) => {
  return apiClient('/api/tasks/complete', {
    initData,
    method: 'POST',
    body: JSON.stringify({ taskType }),
  });
};