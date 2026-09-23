import { get, post } from './client.js';

// { firstName, lastName, email, password, confirmPassword, orgName, orgType, website, description? }
export const signupCreateOrg = data => post('/auth/signup/create-org', data, { auth: false });

// { firstName, lastName, email, password, confirmPassword, orgCode }
export const signupJoinOrg = data => post('/auth/signup/join-org', data, { auth: false });

export const login = (email, password) => post('/auth/login', { email, password }, { auth: false });

export const refresh = refreshToken => post('/auth/refresh', { refreshToken }, { auth: false });

export const me = () => get('/auth/me');

export const requestPasswordReset = email =>
  post('/auth/password-reset/request', { email }, { auth: false });

export const confirmPasswordReset = (token, newPassword, confirmPassword) =>
  post('/auth/password-reset/confirm', { token, newPassword, confirmPassword }, { auth: false });
