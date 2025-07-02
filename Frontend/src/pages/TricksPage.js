import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import SearchBar from '../components/SearchBar';
import TrickList from '../components/TrickList';
import { PageWrapper, PageTitle, LoadingMessage, ErrorMessage, Button, Card } from '../components/shared/StyledComponents';

const TricksWrapper = styled(PageWrapper)`
  max-width: 1000px;
`;

const TricksTitle = styled(PageTitle)`
  font-family: var(--font-accent);
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px var(--shadow-light);
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const CreateTrickButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--btn-primary);
  border-radius: 4px;
  background: transparent;
  color: var(--btn-primary);
  font-size: 1rem;
  font-weight: 500;
  font-family: var(--font-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    background: var(--btn-primary);
    color: var(--text-white);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px var(--shadow-medium);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const SearchSection = styled.div`
  margin-bottom: 2rem;
`;

const TricksPage = () => {
  const [tricks, setTricks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTricks = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          searchQuery ? `/tricks/search?q=${encodeURIComponent(searchQuery)}` : '/tricks'
        );
        setTricks(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load tricks');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchTricks();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <TricksWrapper>
      <HeaderSection>
        <TricksTitle>Tricks Collection</TricksTitle>
        {user && (
          <CreateTrickButton to="/create-trick">
            Create Trick
          </CreateTrickButton>
        )}
      </HeaderSection>

      <SearchSection>
        <SearchBar onSearch={setSearchQuery} />
      </SearchSection>

      {loading && <LoadingMessage>Loading tricks...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!loading && !error && (
        tricks.length === 0 ? (
          <Card>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 0 }}>
              {searchQuery ? `No tricks found for "${searchQuery}"` : 'No tricks available'}
            </p>
          </Card>
        ) : (
          <TrickList tricks={tricks} />
        )
      )}
    </TricksWrapper>
  );
};

export default TricksPage;