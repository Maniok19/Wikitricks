import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Textarea, FormContainer, FormGroup, Label, ErrorMessage } from './shared/StyledComponents';
import axiosInstance from '../utils/axios';

const CreateForumTopic = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/forum/topics', formData);
      navigate(`/forum/topic/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <FormContainer as="div">
        <ErrorMessage>You must be logged in to create a topic.</ErrorMessage>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Link 
        to="/forum" 
        style={{ 
          color: 'var(--btn-primary)', 
          textDecoration: 'none', 
          marginBottom: '1rem', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontFamily: 'var(--font-secondary)',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'all 0.3s ease'
        }}
      >
        ← Back to Forum
      </Link>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Topic Title *</Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Topic'}
          </Button>
        </div>
      </form>
    </FormContainer>
  );
};

export default CreateForumTopic;