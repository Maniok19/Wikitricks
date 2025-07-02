import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import GoogleLogin from './GoogleLogin';
import {
  PageWrapper,
  PageTitle,
  FormContainer,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage
} from './shared/StyledComponents';
import styled from 'styled-components';

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-light);
  }
  
  span {
    padding: 0 1rem;
    color: var(--text-muted);
    font-size: 0.875rem;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.post('/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      await login({ token, user });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <FormContainer>
        <PageTitle>LOGIN</PageTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <GoogleLogin disabled={loading} />
        
        <Divider>
          <span>OR</span>
        </Divider>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </FormGroup>

          <Button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </Button>
        </form>
      </FormContainer>
    </PageWrapper>
  );
};

export default Login;