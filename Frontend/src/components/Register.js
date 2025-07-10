import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  ErrorMessage,
  SuccessMessage
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

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    region: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    if (!formData.email) return "Email is required";
    if (!formData.email.includes('@')) return "Email is not valid";
    if (!formData.username) return "Username is required";
    if (!formData.region) return "Region is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.post('/register', {
        email: formData.email,
        username: formData.username,
        region: formData.region,
        password: formData.password
      });
      
      setSuccess('Registration successful! Please check your email to verify your account.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <FormContainer>
        <PageTitle>REGISTER</PageTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            {/* Optionally show a general error */}
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="region">Region</Label>
            <Input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Your region/city"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </FormGroup>

          <Button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </Button>
        </form>
      </FormContainer>
    </PageWrapper>
  );
};

export default Register;