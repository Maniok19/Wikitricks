import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Textarea, Select, FormContainer, FormGroup, Label, ErrorMessage } from './shared/StyledComponents';
import axiosInstance from '../utils/axios';

const CreateTrick = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    videoUrl: '',
    difficulty: 'beginner'  // Add default difficulty
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

  const validateForm = () => {
    if (!formData.name.trim()) return "Le titre est requis";
    if (!formData.description.trim()) return "La description est requise";
    if (!formData.videoUrl.trim()) return "L'URL de la vidéo est requise";
    
    // Validate YouTube URL
    if (!formData.videoUrl.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/)) {
      return "L'URL doit être une URL YouTube valide";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Add validation check before submitting
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/create-trick', formData);
      // Redirect to the newly created trick's detail page
      navigate(`/trick/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create trick');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <FormContainer as="div">
        <ErrorMessage>You must be logged in to create a trick.</ErrorMessage>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Link 
        to="/tricks" 
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
        ← Back to Tricks
      </Link>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Trick Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
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

        <FormGroup>
          <Label htmlFor="videoUrl">Video URL *</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="url"
            value={formData.videoUrl}
            onChange={handleChange}
            disabled={loading}
            required
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </Select>
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Trick'}
          </Button>
        </div>
      </form>
    </FormContainer>
  );
};

export default CreateTrick;