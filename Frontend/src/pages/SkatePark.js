import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SkateParksMap from '../components/SkateParksMap';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { Button, LinkButton } from '../components/shared/StyledComponents';

const SkateParksWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
  font-family: var(--font-accent);
`;

const SectionTitle = styled.h1`
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
  font-family: var(--font-accent);
`;

const ParksList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const ParkCard = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-medium);
    border-color: var(--btn-primary);
  }

  h3 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-family: var(--font-accent);
  }

  .address {
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: 1rem;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }

  .coordinates {
    font-size: 0.875rem;
    color: var(--text-muted);
    font-family: monospace;
  }
`;

const ParkName = styled.h3`
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-family: var(--font-accent);
  font-size: 1.6rem;
  text-shadow: 1px 1px 2px var(--shadow-light);
`;

const ParkAddress = styled.p`
  color: var(--text-muted);
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 400;
`;

const ParkDescription = styled.p`
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
  line-height: 1.6;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: var(--text-muted);
  font-size: 1.1rem;
  margin: 2rem 0;
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: var(--btn-danger);
  font-size: 1.1rem;
  margin: 2rem 0;
  font-weight: 500;
`;

const SkatePark = () => {
  const [skateParks, setSkateParks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSkateParks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('/skateparks');
        setSkateParks(response.data);
      } catch (error) {
        console.error('Failed to fetch skate parks:', error);
        setError('Error loading skateparks');
      } finally {
        setLoading(false);
      }
    };

    fetchSkateParks();
  }, []);

  return (
    <SkateParksWrapper>
      <HeaderSection>
        <h1 className="page-title">Skateparks</h1>
        <LinkButton to="/create-skatepark" variant="success">
          Create Skatepark
        </LinkButton>
      </HeaderSection>
      
      <SectionTitle>Skateparks Map</SectionTitle>
      <SkateParksMap />

      <SectionTitle>All Skateparks</SectionTitle>
      {loading && <LoadingMessage>Loading skateparks...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {!loading && !error && (
        <ParksList>
          {skateParks.map(park => (
            <ParkCard key={park.id}>
              <h3>{park.name}</h3>
              <p className="address">{park.address}</p>
              <p>{park.description}</p>
              <p className="coordinates">
                📍 {park.lat}, {park.lng}
              </p>
            </ParkCard>
          ))}
        </ParksList>
      )}
    </SkateParksWrapper>
  );
};

export default SkatePark;