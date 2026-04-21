import axios from 'axios';

const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    const data = err.response?.data || {};
    return Promise.reject({
      message: data.message || err.message || 'Request failed',
      errors: data.errors || null,
      status: err.response?.status,
    });
  }
);

export default client;
