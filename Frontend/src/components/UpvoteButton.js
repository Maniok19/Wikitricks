import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

const UpvoteContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UpvoteBtn = styled.button`
  background: ${props => props.$upvoted ? 'var(--btn-danger)' : 'transparent'};
  border: 2px solid ${props => props.$upvoted ? 'var(--btn-danger)' : 'var(--border-light)'};
  color: ${props => props.$upvoted ? 'var(--text-white)' : 'var(--text-muted)'};
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;

  &:hover:not(:disabled) {
    background: ${props => props.$upvoted ? 'var(--btn-danger)' : 'var(--btn-danger)'};
    border-color: var(--btn-danger);
    color: var(--text-white);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UpvoteCount = styled.span`
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
`;

const UpvoteButton = ({ type, itemId, initialCount = 0, initialUpvoted = false }) => {
  const { user } = useAuth();
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUpvoteStatus();
    }
  }, [user, itemId]);

  const fetchUpvoteStatus = async () => {
    try {
      const endpoint = type === 'trick' 
        ? `/tricks/${itemId}/upvote-status`
        : `/replies/${itemId}/upvote-status`;
      
      const response = await axiosInstance.get(endpoint);
      setUpvoted(response.data.upvoted);
      setCount(response.data.upvote_count);
    } catch (error) {
      console.error('Failed to fetch upvote status:', error);
    }
  };

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || loading) return;

    setLoading(true);
    try {
      const endpoint = type === 'trick' 
        ? `/tricks/${itemId}/upvote`
        : `/replies/${itemId}/upvote`;
      
      const response = await axiosInstance.post(endpoint);
      setUpvoted(response.data.upvoted);
      setCount(response.data.upvote_count);
    } catch (error) {
      console.error('Failed to upvote:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <UpvoteContainer>
        <UpvoteBtn disabled>❤️</UpvoteBtn>
        <UpvoteCount>{count}</UpvoteCount>
      </UpvoteContainer>
    );
  }

  return (
    <UpvoteContainer>
      <UpvoteBtn 
        $upvoted={upvoted}
        onClick={handleUpvote}
        disabled={loading}
        title={upvoted ? 'Remove like' : 'Like'}
      >
        {upvoted ? '❤️' : '🤍'}
      </UpvoteBtn>
      <UpvoteCount>{count}</UpvoteCount>
    </UpvoteContainer>
  );
};

export default UpvoteButton;