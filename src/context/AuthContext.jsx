import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bus_app_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bus_app_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('bus_app_session');
    }
  }, [user]);

  const loginAdmin = async (college_id, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/admin/login', { college_id, password });
      if (res.success) {
        setUser(res.user);
        return { success: true };
      } else {
        setError(res.message);
        return { success: false, message: res.message };
      }
    } catch (e) {
      setError('Login failed.');
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  const registerAdmin = async (college_id, password, name, college_name, security_code) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/admin/register', { college_id, password, name, college_name, security_code });
      if (res.success) {
        setUser(res.user);
        return { success: true };
      } else {
        setError(res.message);
        return { success: false, message: res.message };
      }
    } catch (e) {
      setError('Registration failed.');
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  const loginDriver = async (driver_id, password, secret_key) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/driver/login', { driver_id, password, secret_key });
      if (res.success) {
        setUser(res.user);
        return { success: true };
      } else {
        setError(res.message);
        return { success: false, message: res.message };
      }
    } catch (e) {
      setError('Login failed.');
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  const registerDriver = async (driver_id, name, password, secret_key) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/driver/register', { driver_id, name, password, secret_key });
      if (res.success) {
        setUser(res.user);
        return { success: true };
      } else {
        setError(res.message);
        return { success: false, message: res.message };
      }
    } catch (e) {
      setError('Driver sign up failed.');
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  const loginStudent = async (roll_number, password, secret_key) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/student/login', { roll_number, password, secret_key });
      if (res.success) {
        setUser(res.user);
        return { success: true };
      } else {
        setError(res.message);
        return { success: false, message: res.message };
      }
    } catch (e) {
      setError('Login failed.');
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async (roll_number, college_id, name, password, secret_key) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/student/register', { roll_number, college_id, name, password, secret_key });
      if (res.success) {
        setUser(res.user);
        return { success: true };
      } else {
        setError(res.message);
        return { success: false, message: res.message };
      }
    } catch (e) {
      setError('Student sign up failed.');
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bus_app_session');
  };

  return (
    <AuthContext.Provider value={{
      user, loading, error, setError,
      loginAdmin, registerAdmin,
      loginDriver, registerDriver,
      loginStudent, registerStudent,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
