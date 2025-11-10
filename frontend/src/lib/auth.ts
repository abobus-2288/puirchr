import Cookies from 'js-cookie';
import { User } from '@/types';

export const setAuthToken = (token: string) => {
  Cookies.set('auth_token', token, { expires: 7 });
};

export const getAuthToken = () => {
  return Cookies.get('auth_token');
};

export const removeAuthToken = () => {
  Cookies.remove('auth_token');
};

export const setUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const isAdmin = (user: User | null): boolean => {
  return user?.roles?.some(role => role.name === 'admin') ?? false;
};

export const logout = () => {
  removeAuthToken();
  removeUser();
  window.location.href = '/login';
};
