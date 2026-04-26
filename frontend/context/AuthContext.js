'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          setIsAdmin(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else if (adminToken) {
      setIsAdmin(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, isAdminLogin = false) => {
    try {
      const endpoint = isAdminLogin ? '/auth/admin-login' : '/auth/login';
      const res = await api.post(endpoint, { email, password });
      const { token } = res.data;
      
      if (isAdminLogin) {
        localStorage.setItem('adminToken', token);
        setIsAdmin(true);
        toast.success('Admin logged in');
        router.push('/admin');
      } else {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const userRes = await api.get('/auth/me');
        setUser(userRes.data.user);
        setIsAdmin(false);
        toast.success('Logged in successfully');
        router.push('/');
      }
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAdmin(false);
    router.push('/');
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);