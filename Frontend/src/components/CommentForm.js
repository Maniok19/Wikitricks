import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './shared/StyledComponents';

const Form = styled.form`
  margin: 2rem 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  min-height: 100px;
`;

const CommentForm = ({ onSubmit }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(content);
    setContent('');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment..."
      />
      <Button type="submit" variant="primary">
        Post Comment
      </Button>
    </Form>
  );
};

export default CommentForm;