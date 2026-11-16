import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        try {
          const res = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${parsedUser.token}` }
          });
          setUser({ ...res.data, token: parsedUser.token });
        } catch (error) {
          console.error('Failed to authenticate:', error);
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    setUser(res.data);
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    setUser(res.data);
  };

  const loginWithGoogle = async (credential) => {
    const res = await axios.post(`${API_URL}/api/auth/google`, { credential });
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, loginWithGoogle, logout, loading }}>
        {children}
    </AuthContext.Provider>
  );
};
