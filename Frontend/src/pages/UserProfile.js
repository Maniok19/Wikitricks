import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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
} from '../components/shared/StyledComponents';

const ProfileWrapper = styled(PageWrapper)`
  max-width: 600px;
`;

const ProfileTitle = styled(PageTitle)`
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DisabledInput = styled(Input)`
  background-color: var(--background-light);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.7;
`;

const PasswordSection = styled.div`
  background: var(--background);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const SectionTitle = styled.h3`
  color: var(--text-primary);
  font-family: var(--font-secondary);
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--btn-primary);
`;

const GoogleUserNote = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '🔒';
    font-size: 1.2rem;
  }
`;

const UserProfile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    region: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Check if user is Google-authenticated
  const isGoogleUser = user?.google_id;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      username: user.username || '',
      email: user.email || '',
      region: user.region || ''
    }));
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validation for new password (only for non-Google users)
      if (!isGoogleUser && formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }

      // For Google users, don't require current password for basic profile updates
      const updateData = {
        username: formData.username,
        region: formData.region
      };

      // Only include password fields for non-Google users
      if (!isGoogleUser) {
        updateData.currentPassword = formData.currentPassword;
        if (formData.newPassword) {
          updateData.newPassword = formData.newPassword;
        }
      }

      const response = await axiosInstance.put('/user/profile', updateData);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update user information in context
      login({ token: localStorage.getItem('token'), user: response.data });
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'An error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <ProfileWrapper>
      <ProfileTitle>My Profile</ProfileTitle>
      
      <FormContainer>
        {isGoogleUser && (
          <GoogleUserNote>
            You're signed in with Google. Password management is handled by Google.
          </GoogleUserNote>
        )}

        {message.text && message.type === 'error' && (
          <ErrorMessage>{message.text}</ErrorMessage>
        )}
        
        {message.text && message.type === 'success' && (
          <SuccessMessage>{message.text}</SuccessMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Email</Label>
            <DisabledInput
              type="email"
              value={formData.email}
              disabled
            />
          </FormGroup>

          <FormGroup>
            <Label>Username</Label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Region</Label>
            <Input
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Optional"
            />
          </FormGroup>

          {!isGoogleUser && (
            <PasswordSection>
              <SectionTitle>Security Settings</SectionTitle>
              
              <FormGroup>
                <Label>Current password (required for modifications)</Label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>New password (optional)</Label>
                <Input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                />
              </FormGroup>
            </PasswordSection>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            variant="primary"
            size="large"
            fullWidth
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </Form>
      </FormContainer>
    </ProfileWrapper>
  );
};

export default UserProfile;