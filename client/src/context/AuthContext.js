// src/context/AuthContext.js
// Global auth state — provides user info + login/logout helpers
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,          setUser]          = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [token,         setToken]         = useState(null);
  const [isLoading,     setIsLoading]     = useState(true); // true while checking stored token

  // On app launch, check if a token exists in storage
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('kaigo_token');
        const storedUser  = await AsyncStorage.getItem('kaigo_user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.warn('Failed to load stored auth:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  // Save token + user to state and AsyncStorage
  const saveAuth = async (authToken, userData, driverData = null) => {
    await AsyncStorage.setItem('kaigo_token', authToken);
    await AsyncStorage.setItem('kaigo_user',  JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    setDriverProfile(driverData);
  };

  // Login: call API, persist result
  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    await saveAuth(data.token, data.user, data.driverProfile);
    return data;
  };

  // Register: call API, persist result
  const register = async (formData) => {
    const data = await api.post('/auth/register', formData);
    await saveAuth(data.token, data.user, data.driverProfile);
    return data;
  };

  // Logout: clear everything
  const logout = async () => {
    await AsyncStorage.multiRemove(['kaigo_token', 'kaigo_user']);
    setToken(null);
    setUser(null);
    setDriverProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      driverProfile,
      token,
      isLoading,
      isLoggedIn: !!user,
      isDriver:   user?.role === 'driver',
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
