import api from './client';

export const registerUser = (firstName, lastName, email, password) =>
  api.post('/auth/register', { firstName, lastName, email, password }).then((res) => res.data);

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password }).then((res) => res.data);