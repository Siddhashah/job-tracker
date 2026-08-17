import api from './client';

export const extractPosting = (text) => api.post('/extract', { text }).then((res) => res.data);