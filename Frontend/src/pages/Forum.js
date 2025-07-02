import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import SearchBar from '../components/SearchBar';
import {
  PageWrapper,
  PageTitle,
  LinkButton,
  Card,
  LoadingMessage,
  ErrorMessage
} from '../components/shared/StyledComponents';
import styled from 'styled-components';

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

const SearchSection = styled.div`
  margin-bottom: 2rem;
`;

const TopicList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TopicCard = styled(Link)`
  display: block;
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-light);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px var(--shadow-medium);
    border-color: var(--btn-primary);
  }
  
  ${props => props.$pinned && `
    border-left: 4px solid var(--btn-danger);
    background: var(--background-light);
  `}
`;

const TopicTitle = styled.h3`
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-secondary);
`;

const PinnedBadge = styled.span`
  background: var(--btn-danger);
  color: var(--text-white);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 500;
`;

const TopicMeta = styled.div`
  color: var(--text-muted);
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TopicDescription = styled.p`
  color: var(--text-secondary);
  margin: 0.5rem 0;
  line-height: 1.6;
`;

const Forum = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          searchQuery ? `/forum/search?q=${encodeURIComponent(searchQuery)}` : '/forum/topics'
        );
        setTopics(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchTopics();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <PageWrapper>
      <HeaderSection>
        <PageTitle>Forum</PageTitle>
        {user && (
          <LinkButton to="/forum/create-topic">
            CREATE TOPIC
          </LinkButton>
        )}
      </HeaderSection>

      <SearchSection>
        <SearchBar onSearch={setSearchQuery} placeholder="Search topics..." />
      </SearchSection>

      {loading && <LoadingMessage>Loading forum...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!loading && !error && (
        topics.length === 0 ? (
          <Card>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 0 }}>
              {searchQuery ? `No topics found for "${searchQuery}"` : 'No topics found'}
            </p>
          </Card>
        ) : (
          <TopicList>
            {topics.map(topic => (
              <TopicCard 
                key={topic.id} 
                to={`/forum/topic/${topic.id}`}
                $pinned={topic.pinned}
              >
                <TopicTitle>
                  {topic.title}
                  {topic.pinned && <PinnedBadge>Pinned</PinnedBadge>}
                </TopicTitle>
                {topic.description && (
                  <TopicDescription>{topic.description}</TopicDescription>
                )}
                <TopicMeta>
                  <span>By {topic.username}</span>
                  <span>{topic.reply_count || 0} replies</span>
                </TopicMeta>
              </TopicCard>
            ))}
          </TopicList>
        )
      )}
    </PageWrapper>
  );
};

export default Forum;