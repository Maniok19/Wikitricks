import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Vérification en cours...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/verify-email/${token}`);
        setStatus('Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus(error.response?.data?.error || 'An error occurred');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Email Verification</h2>
        <p>{status}</p>
      </div>
    </div>
  );
};

export default EmailVerification;