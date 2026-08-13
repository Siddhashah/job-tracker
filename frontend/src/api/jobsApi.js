import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getJobs = () => api.get('/jobs').then((res) => res.data);
export const createJob = (job) => api.post('/jobs', job).then((res) => res.data);
export const updateJob = (id, updates) => api.patch(`/jobs/${id}`, updates).then((res) => res.data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`).then((res) => res.data);