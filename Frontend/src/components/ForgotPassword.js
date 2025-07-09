import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import {
  PageWrapper,
  PageTitle,
  FormContainer,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
  SuccessMessage
} from './shared/StyledComponents';
import styled from 'styled-components';

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--btn-primary);
  text-decoration: none;
  margin-bottom: 1rem;
  font-family: var(--font-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(-2px);
  }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axiosInstance.post('/forgot-password', {
        email
      });
      
      setMessage(response.data.message);
      setEmail(''); // Clear form
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <FormContainer>
        <BackLink to="/login">← Back to Login</BackLink>
        
        <PageTitle>FORGOT PASSWORD</PageTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {message && <SuccessMessage>{message}</SuccessMessage>}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </FormGroup>

          <Button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'SENDING...' : 'SEND RESET LINK'}
          </Button>
        </form>
      </FormContainer>
    </PageWrapper>
  );
};

export default ForgotPassword;