import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axiosInstance from '../utils/axios';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import { 
  PageWrapper, 
  LoadingMessage, 
  ErrorMessage 
} from '../components/shared/StyledComponents';
import { useAuth } from '../contexts/AuthContext';
const TrickDetailsWrapper = styled(PageWrapper)`
  max-width: 800px;
`;

const TrickTitle = styled.h1`
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-family: var(--font-accent);
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px var(--shadow-light);
  text-align: center;
`;

const TrickDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: center;
  font-weight: 400;
`;

const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; // 16:9 aspect ratio
  height: 0;
  overflow: hidden;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow-medium);
  border: 2px solid var(--border-light);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--btn-primary);
    box-shadow: 0 8px 24px var(--shadow-heavy);
  }
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 6px;
  }
`;

const TrickMeta = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px var(--shadow-light);

  .difficulty {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: bold;
    text-transform: uppercase;
    margin: 0.5rem;
    
    &.beginner { 
      background: var(--btn-success); 
      color: var(--text-white); 
    }
    &.intermediate { 
      background: var(--gritty-yellow); 
      color: var(--background);
    }
    &.advanced { 
      background: var(--secondary); 
      color: var(--text-white); 
    }
    &.expert { 
      background: var(--btn-danger); 
      color: var(--text-white); 
    }
  }

  .meta-item {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin: 0.25rem 0;
    
    strong {
      color: var(--text-primary);
    }
  }
`;

const CommentsSection = styled.section`
  margin-top: 3rem;
  
  h3 {
    font-family: var(--font-accent);
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    text-align: center;
  }
`;

const UserControls = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
`;

const DeleteButton = styled.button`
  background: var(--btn-danger);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;

  &:hover {
    background: var(--btn-danger-hover);
  }
`;

const TrickDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trick, setTrick] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrick = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/tricks/${id}`);
        setTrick(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load trick details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrick();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(`/tricks/${id}/comments`);
        setComments(response.data);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      }
    };
    
    fetchComments();
  }, [id]);

  const handleCommentSubmit = async (content) => {
    try {
      const response = await axiosInstance.post(`/tricks/${id}/comments`, { content });
      setComments([response.data, ...comments]);
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleDeleteTrick = async () => {
    if (!window.confirm('Are you sure you want to delete this trick?')) return;
    
    try {
      // Use the regular delete endpoint for own tricks, admin endpoint for admin actions
      const endpoint = user && user.is_admin && trick.user_id !== user.id 
        ? `/admin/tricks/${id}` 
        : `/tricks/${id}`;
      
      await axiosInstance.delete(endpoint);
      navigate('/tricks');
    } catch (err) {
      console.error('Failed to delete trick:', err);
      alert('Failed to delete trick');
    }
  };

  const handleCommentDelete = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  // Check if user can delete this trick - admin can delete any trick
  const canDeleteTrick = user && (
    user.is_admin || 
    (trick && trick.user_id === user.id)
  );

  // Add debugging
  console.log('Delete button debug:', {
    user: user,
    isAdmin: user?.is_admin,
    trickUserId: trick?.user_id,
    userIdMatch: trick?.user_id === user?.id,
    canDelete: canDeleteTrick
  });

  if (loading) {
    return <LoadingMessage>Loading trick details...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!trick) {
    return <ErrorMessage>Trick not found</ErrorMessage>;
  }

  return (
    <TrickDetailsWrapper>
      <TrickTitle>{trick.title}</TrickTitle>
      <TrickDescription>{trick.description}</TrickDescription>
      
      {trick.video_url && (
        <VideoContainer>
          <iframe
            src={trick.video_url}
            title={trick.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </VideoContainer>
      )}

      <TrickMeta>
        {trick.difficulty && (
          <div className={`difficulty ${trick.difficulty.toLowerCase()}`}>
            {trick.difficulty}
          </div>
        )}
        {trick.username && (
          <div className="meta-item">
            <strong>Created by:</strong> {trick.username}
          </div>
        )}
        {trick.created_at && (
          <div className="meta-item">
            <strong>Posted:</strong> {new Date(trick.created_at).toLocaleDateString()}
          </div>
        )}
      </TrickMeta>

      {canDeleteTrick && (
        <UserControls>
          <DeleteButton onClick={handleDeleteTrick}>
            Delete Trick
          </DeleteButton>
        </UserControls>
      )}

      <CommentsSection>
        <CommentForm onSubmit={handleCommentSubmit} />
        <CommentList comments={comments} onCommentDelete={handleCommentDelete} />
      </CommentsSection>
    </TrickDetailsWrapper>
  );
};

export default TrickDetails;