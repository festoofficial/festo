import React, { createContext, useContext, useState, useEffect } from 'react';
import { otpAPI } from '../services/api';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const sendOTP = async (email, name, college, role) => {
    try {
      const result = await otpAPI.sendOTP(email, name, college, role);
      console.log('OTP sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  const verifyOTPAndCreateAccount = async (email, otp, password) => {
    try {
      // Verify OTP
      const verifyResult = await otpAPI.verifyOTP(email, otp);
      console.log('OTP verified:', verifyResult);

      const { userData } = verifyResult;

      // Create account
      const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: password,
          college: userData.college,
          role: userData.role
        }),
      });

      if (!signupResponse.ok) {
        const error = await signupResponse.json();
        throw new Error(error.message || 'Signup failed');
      }

      console.log('Account created successfully');

      // Do not auto-login; require user to login manually
      return { success: true };
    } catch (error) {
      console.error('Error:', error);
      throw new Error(error.message || 'Failed to complete signup');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, sendOTP, verifyOTPAndCreateAccount, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
