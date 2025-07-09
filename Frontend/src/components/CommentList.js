import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import styled from 'styled-components';

const CommentContainer = styled.div`
  margin: 2rem 0;
`;

const Comment = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-light);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--shadow-medium);
    border-color: var(--btn-primary);
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CommentMeta = styled.div`
  color: var(--text-muted);
  font-size: 0.875rem;
  font-family: var(--font-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CommentContent = styled.p`
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
`;

const AdminControls = styled.div`
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

const CommentList = ({ comments, onCommentDelete }) => {
  const { user } = useAuth();

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await axiosInstance.delete(`/admin/comments/${commentId}`);
      if (onCommentDelete) onCommentDelete(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <CommentContainer>
      <h3>Comments</h3>
      {comments.map(comment => (
        <Comment key={comment.id}>
          <CommentHeader>
            <CommentMeta>
              By {comment.username || comment.user_name || comment.author || 'Anonymous'}
              {comment.region && ` (${comment.region})`}
              {' '}on {new Date(comment.created_at || comment.created).toLocaleDateString()}
            </CommentMeta>
            {user && user.is_admin && (
              <AdminControls>
                <AdminButton onClick={() => handleDeleteComment(comment.id)}>
                  Delete
                </AdminButton>
              </AdminControls>
            )}
          </CommentHeader>
          <CommentContent>{comment.content}</CommentContent>
        </Comment>
      ))}
    </CommentContainer>
  );
};

export default CommentList;