import React from 'react';
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

const CommentMeta = styled.div`
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
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

const CommentList = ({ comments }) => {
  return (
    <CommentContainer>
      <h3>Comments</h3>
      {comments.map(comment => (
        <Comment key={comment.id}>
          <CommentMeta>
            By {comment.username || comment.user_name || comment.author || 'Anonymous'}
            {comment.region && ` (${comment.region})`}
            {' '}on {new Date(comment.created_at || comment.created).toLocaleDateString()}
          </CommentMeta>
          <CommentContent>{comment.content}</CommentContent>
        </Comment>
      ))}
    </CommentContainer>
  );
};

export default CommentList;