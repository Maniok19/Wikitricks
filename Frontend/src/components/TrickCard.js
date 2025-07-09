// wikitricks/src/components/TrickCard.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UpvoteButton from './UpvoteButton';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

const Card = styled(Link)`
  display: block;
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-light);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(52, 152, 219, 0.1),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: var(--btn-primary);
    box-shadow: 0 8px 24px var(--shadow-medium);

    &::before {
      left: 100%;
    }
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      var(--gritty-yellow),
      var(--dirty-red),
      var(--faded-blue)
    );
  }
`;

const TrickTitle = styled.h2`
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 1rem;
  font-family: 'Permanent Marker', cursive;
  font-size: 1.6rem;
  text-shadow: 1px 1px 2px var(--shadow-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TrickDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-weight: 400;
  line-height: 1.6;
`;

const VideoPreview = styled.div`
  margin-top: 1rem;
  position: relative;
  
  iframe {
    width: 100%;
    max-width: 560px;
    height: 315px;
    border: 2px solid var(--border-medium);
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--shadow-light);
  }

  a {
    color: var(--btn-primary);
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      color: var(--btn-primary-hover);
      text-decoration: underline;
    }
  }
`;

const CreatedDate = styled.small`
  color: var(--text-muted);
  display: block;
  margin-top: 1rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DifficultyBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 2px solid;
  background: ${props => {
    switch (props.level) {
      case 'beginner': return 'var(--btn-success)';
      case 'intermediate': return 'var(--gritty-yellow)';
      case 'advanced': return 'var(--secondary)'; // Changed from var(--worn-orange)
      case 'expert': return 'var(--btn-danger)';
      default: return 'var(--btn-secondary)';
    }
  }};
  border-color: ${props => {
    switch (props.level) {
      case 'beginner': return 'var(--btn-success-hover)';
      case 'intermediate': return '#e67e22';
      case 'advanced': return 'var(--secondary)'; // Changed from '#d35400'
      case 'expert': return 'var(--btn-danger-hover)';
      default: return 'var(--btn-secondary-hover)';
    }
  }};
  color: ${props => {
    // Fix text visibility for intermediate/yellow background
    if (props.level === 'intermediate') {
      return 'var(--background)'; // Dark text on yellow background
    }
    return 'var(--text-white)';
  }};
  box-shadow: 0 2px 8px var(--shadow-light);
`;

const SkateIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 0.5rem;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
`;

const AdminControls = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
`;

const AdminButton = styled.button`
  background: var(--btn-danger);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: var(--btn-danger-hover);
  }
`;

const TrickCard = ({ trick, onTrickDelete }) => {
  const { user } = useAuth();
  const isYouTubeUrl = trick.video_url.includes('youtube.com/embed/');

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'ROOKIE';
      case 'intermediate': return 'STREET';
      case 'advanced': return 'PRO';
      case 'expert': return 'LEGEND';
      default: return difficulty.toUpperCase();
    }
  };

  const handleDeleteTrick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this trick?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.delete(`/admin/tricks/${trick.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        if (onTrickDelete) onTrickDelete(trick.id);
        alert('Trick deleted successfully');
      }
    } catch (err) {
      console.error('Failed to delete trick:', err);
      if (err.response?.status === 403) {
        alert('You need admin privileges to delete tricks');
      } else {
        alert('Failed to delete trick: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <Card to={`/trick/${trick.id}`} className="card">
      {user && user.is_admin && (
        <AdminControls>
          <AdminButton onClick={handleDeleteTrick}>
            Delete
          </AdminButton>
        </AdminControls>
      )}
      
      <TrickTitle className="graffiti-text">
        <span>
          <SkateIcon>🛹</SkateIcon>
          {trick.title}
        </span>
        <DifficultyBadge level={trick.difficulty}>
          {getDifficultyText(trick.difficulty)}
        </DifficultyBadge>
      </TrickTitle>
      <TrickDescription>{trick.description}</TrickDescription>
      <VideoPreview>
        {isYouTubeUrl ? (
          <iframe
            src={trick.video_url}
            title={trick.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p>Video URL: <a href={trick.video_url} target="_blank" rel="noopener noreferrer">
            {trick.video_url}
          </a></p>
        )}
      </VideoPreview>
      <CardFooter>
        <CreatedDate>
          DROPPED: {new Date(trick.created).toLocaleDateString()}
        </CreatedDate>
        <UpvoteButton 
          type="trick" 
          itemId={trick.id} 
          initialCount={trick.upvote_count || 0}
        />
      </CardFooter>
    </Card>
  );
};

export default TrickCard;