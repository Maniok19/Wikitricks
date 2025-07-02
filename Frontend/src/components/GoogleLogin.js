import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const GoogleButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #357ae8;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const GoogleIcon = styled.img`
  width: 20px;
  height: 20px;
`;

const GoogleLogin = ({ disabled = false }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    if (window.google && process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const result = await axiosInstance.post('/auth/google', {
        token: response.credential
      });
      
      const { token, user } = result.data;
      await login({ token, user });
      navigate('/');
    } catch (error) {
      console.error('Google login failed:', error);
      alert(error.response?.data?.error || 'Google login failed');
    }
  };

  const handleGoogleLogin = () => {
    if (window.google && process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt();
    } else {
      console.error('Google Sign-In not initialized or missing client ID');
    }
  };

  return (
    <GoogleButton onClick={handleGoogleLogin} disabled={disabled}>
      <GoogleIcon 
        src="https://developers.google.com/identity/images/g-logo.png" 
        alt="Google"
      />
      Continue with Google
    </GoogleButton>
  );
};

export default GoogleLogin;