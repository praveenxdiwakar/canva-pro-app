export const apiClient = async (endpoint, options = {}) => {
  const { initData, ...customConfig } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(initData ? { 'x-init-data': initData } : {}),
    ...customConfig.headers,
  };

  const response = await fetch(endpoint, {
    ...customConfig,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};