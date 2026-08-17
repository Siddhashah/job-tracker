import api from './client';

export const getJobs = () => api.get('/jobs').then((res) => res.data);
export const createJob = (job) => api.post('/jobs', job).then((res) => res.data);
export const updateJob = (id, updates) => api.patch(`/jobs/${id}`, updates).then((res) => res.data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`).then((res) => res.data);
export const getStats = () => api.get('/jobs/stats').then((res) => res.data);