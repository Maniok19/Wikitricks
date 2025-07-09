import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import { 
  PageWrapper, 
  Button, 
  Textarea, 
  LoadingMessage, 
  ErrorMessage,
  Card 
} from '../components/shared/StyledComponents';
import UpvoteButton from '../components/UpvoteButton';

const TopicWrapper = styled(PageWrapper)`
  max-width: 800px;
`;

const BackLink = styled(Link)`
  color: var(--btn-primary);
  text-decoration: none;
  margin-bottom: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--btn-primary-hover);
    transform: translateX(-2px);
  }

  &::before {
    content: '←';
    font-size: 1.2rem;
  }
`;

const TopicHeader = styled(Card)`
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--btn-primary),
      var(--secondary),
      var(--accent)
    );
  }
`;

const TopicTitle = styled.h1`
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-family: var(--font-accent);
  font-size: 2rem;
  text-shadow: 1px 1px 2px var(--shadow-light);
`;

const TopicMeta = styled.div`
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  font-family: var(--font-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TopicDescription = styled.p`
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
`;

const RepliesSection = styled.div`
  margin-bottom: 2rem;

  h3 {
    color: var(--text-primary);
    font-family: var(--font-accent);
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-shadow: 1px 1px 2px var(--shadow-light);
  }
`;

const ReplyCard = styled(Card)`
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--btn-primary);
  }
`;

const ReplyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ReplyMeta = styled.div`
  color: var(--text-muted);
  font-size: 0.875rem;
  font-family: var(--font-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const ReplyContent = styled.p`
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
`;

const ReplyForm = styled.form`
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-light);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--btn-primary),
      var(--secondary),
      var(--accent)
    );
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px var(--shadow-medium);
    border-color: var(--btn-primary);
  }

  h3 {
    color: var(--text-primary);
    font-family: var(--font-accent);
    font-size: 1.3rem;
    margin: 0 0 1rem 0;
    text-shadow: 1px 1px 2px var(--shadow-light);
  }
`;

const StyledTextArea = styled(Textarea)`
  min-height: 120px;
  margin-bottom: 1rem;
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 2rem;
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-secondary);
  font-family: var(--font-secondary);

  a {
    color: var(--btn-primary);
    text-decoration: none;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;

    &:hover {
      color: var(--btn-primary-hover);
      text-decoration: underline;
    }
  }
`;

const ReplyFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-light);
`;

const ForumTopic = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTopicAndReplies = async () => {
      try {
        setLoading(true);
        const [topicResponse, repliesResponse] = await Promise.all([
          axiosInstance.get(`/forum/topics/${id}`),
          axiosInstance.get(`/forum/topics/${id}/replies`)
        ]);
        setTopic(topicResponse.data);
        setReplies(repliesResponse.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load topic');
      } finally {
        setLoading(false);
      }
    };

    fetchTopicAndReplies();
  }, [id]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await axiosInstance.post(`/forum/topics/${id}/replies`, {
        content: replyContent
      });
      setReplies([...replies, response.data]);
      setReplyContent('');
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopic = async () => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    
    try {
      await axiosInstance.delete(`/admin/forum/topics/${id}`);
      navigate('/forum');
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    
    try {
      await axiosInstance.delete(`/admin/forum/replies/${replyId}`);
      setReplies(replies.filter(reply => reply.id !== replyId));
    } catch (err) {
      console.error('Failed to delete reply:', err);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!topic) {
    return <ErrorMessage>Topic not found</ErrorMessage>;
  }

  return (
    <TopicWrapper>
      <BackLink to="/forum">Back to forum</BackLink>
      
      <TopicHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <TopicTitle>{topic.title}</TopicTitle>
            <TopicMeta>
              By {topic.username}
              {topic.user_region && ` (${topic.user_region})`}
              {' '}on {new Date(topic.created).toLocaleDateString()}
            </TopicMeta>
          </div>
          {user && user.is_admin && (
            <AdminControls>
              <AdminButton onClick={handleDeleteTopic}>
                Delete Topic
              </AdminButton>
            </AdminControls>
          )}
        </div>
        {topic.description && (
          <TopicDescription>{topic.description}</TopicDescription>
        )}
      </TopicHeader>

      <RepliesSection>
        <h3>Replies ({replies.length})</h3>
        {replies.map(reply => (
          <ReplyCard key={reply.id}>
            <ReplyHeader>
              <ReplyMeta>
                By {reply.username}
                {reply.user_region && ` (${reply.user_region})`}
                {' '}on {new Date(reply.created).toLocaleDateString()}
              </ReplyMeta>
              {user && user.is_admin && (
                <AdminControls>
                  <AdminButton onClick={() => handleDeleteReply(reply.id)}>
                    Delete
                  </AdminButton>
                </AdminControls>
              )}
            </ReplyHeader>
            <ReplyContent>{reply.content}</ReplyContent>
            <ReplyFooter>
              <div></div>
              <UpvoteButton 
                type="reply" 
                itemId={reply.id} 
                initialCount={reply.upvote_count || 0}
              />
            </ReplyFooter>
          </ReplyCard>
        ))}
      </RepliesSection>

      {user ? (
        <ReplyForm onSubmit={handleReplySubmit}>
          <h3>Reply</h3>
          <StyledTextArea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            required
          />
          <Button type="submit" disabled={submitting} variant="primary">
            {submitting ? 'Publishing...' : 'Post reply'}
          </Button>
        </ReplyForm>
      ) : (
        <LoginPrompt>
          <Link to="/login">Log in</Link> to reply to this topic.
        </LoginPrompt>
      )}
    </TopicWrapper>
  );
};

export default ForumTopic;