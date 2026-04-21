import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('lms_user');
    return s ? JSON.parse(s) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lms_token'));

  useEffect(() => {
    if (token) localStorage.setItem('lms_token', token);
    else localStorage.removeItem('lms_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('lms_user', JSON.stringify(user));
    else localStorage.removeItem('lms_user');
  }, [user]);

  async function login(username, password) {
    const { data } = await client.post('/auth/login', { username, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
