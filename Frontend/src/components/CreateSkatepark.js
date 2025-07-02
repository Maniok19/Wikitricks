import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Textarea, FormContainer, FormGroup, Label, ErrorMessage } from './shared/StyledComponents';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

const CreateSkatepark = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    lat: '',
    lng: ''
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
    if (!formData.name.trim()) return "Name is required";
    if (!formData.address.trim()) return "Address is required";
    if (!formData.lat || !formData.lng) return "GPS coordinates are required";
    
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    
    if (isNaN(lat) || lat < -90 || lat > 90) return "Invalid latitude (-90 to 90)";
    if (isNaN(lng) || lng < -180 || lng > 180) return "Invalid longitude (-180 to 180)";
    
    return null;
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
      const response = await axiosInstance.post('/create-skatepark', {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      });
      navigate('/skateparks');
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating skatepark');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <FormContainer>
        <ErrorMessage>You must be logged in to add a skatepark.</ErrorMessage>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Link 
        to="/skateparks" 
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
        ← Back to Skateparks
      </Link>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Skatepark Name *</Label>
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
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            placeholder="Ex: Republic Square, 75003 Paris"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="any"
            value={formData.lat}
            onChange={handleChange}
            disabled={loading}
            placeholder="Ex: 48.8566"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="any"
            value={formData.lng}
            onChange={handleChange}
            disabled={loading}
            placeholder="Ex: 2.3522"
          />
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Skatepark'}
          </Button>
        </div>
      </form>
    </FormContainer>
  );
};

export default CreateSkatepark;