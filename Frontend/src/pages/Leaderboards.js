import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from '../utils/axios';
import {
  PageWrapper,
  PageTitle,
  Card,
  LoadingMessage,
  ErrorMessage
} from '../components/shared/StyledComponents';

const LeaderboardsWrapper = styled(PageWrapper)`
  max-width: 1200px;
`;

const LeaderboardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const LeaderboardCard = styled(Card)`
  padding: 1.5rem;
`;

const LeaderboardTitle = styled.h3`
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--btn-primary);
  font-family: var(--font-accent);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LeaderboardList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const LeaderboardItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: var(--background-light);
  border-radius: 8px;
  border-left: 4px solid ${props => {
    if (props.$rank === 1) return 'var(--btn-danger)';
    if (props.$rank === 2) return 'var(--btn-warning)';
    if (props.$rank === 3) return 'var(--btn-success)';
    return 'var(--btn-primary)';
  }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-medium);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RankBadge = styled.span`
  background: ${props => {
    if (props.$rank === 1) return 'var(--btn-danger)';
    if (props.$rank === 2) return 'var(--btn-warning)';
    if (props.$rank === 3) return 'var(--btn-success)';
    return 'var(--btn-primary)';
  }};
  color: var(--text-white);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
`;

const UserDetails = styled.div`
  h4 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1rem;
  }
  
  p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.875rem;
  }
`;

const ScoreBadge = styled.span`
  background: var(--background-secondary);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  border: 1px solid var(--border-light);
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
  font-style: italic;
`;

const Leaderboards = () => {
  const [leaderboards, setLeaderboards] = useState({
    trick_contributors: [],
    topic_contributors: [],
    commenters: [],
    forum_participants: [],
    top_upvoted_tricks: [] // Ensure this matches the backend response
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/leaderboards');
        setLeaderboards(response.data);
      } catch (err) {
        setError('Failed to load leaderboards');
        console.error('Error fetching leaderboards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  const LeaderboardSection = ({ title, data, scoreLabel, icon }) => (
    <LeaderboardCard>
      <LeaderboardTitle>
        <span>{icon}</span>
        {title}
      </LeaderboardTitle>
      {data.length === 0 ? (
        <EmptyState>No data available yet</EmptyState>
      ) : (
        <LeaderboardList>
          {data.map((item, index) => (
            <LeaderboardItem key={item.id || item.user_id} $rank={index + 1}>
              <UserInfo>
                <RankBadge $rank={index + 1}>
                  {index + 1}
                </RankBadge>
                <UserDetails>
                  <h4>{item.username || item.title}</h4>
                  {item.region && <p>{item.region}</p>}
                </UserDetails>
              </UserInfo>
              <ScoreBadge>
                {item.count || item.upvote_count} {scoreLabel}
              </ScoreBadge>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
      )}
    </LeaderboardCard>
  );

  if (loading) {
    return (
      <LeaderboardsWrapper>
        <LoadingMessage>Loading leaderboards...</LoadingMessage>
      </LeaderboardsWrapper>
    );
  }

  if (error) {
    return (
      <LeaderboardsWrapper>
        <ErrorMessage>{error}</ErrorMessage>
      </LeaderboardsWrapper>
    );
  }

  return (
    <LeaderboardsWrapper>
      <PageTitle>🏆 LEADERBOARDS</PageTitle>
      
      <LeaderboardsGrid>
        <LeaderboardSection
          title="Top Trick Contributors"
          data={leaderboards.trick_contributors}
          scoreLabel="tricks"
          icon="🛹"
        />
        
        <LeaderboardSection
          title="Top Forum Contributors"
          data={leaderboards.topic_contributors}
          scoreLabel="topics"
          icon="💬"
        />
        
        <LeaderboardSection
          title="Most Active Commenters"
          data={leaderboards.commenters}
          scoreLabel="comments"
          icon="💭"
        />
        
        <LeaderboardSection
          title="Forum Participants"
          data={leaderboards.forum_participants}
          scoreLabel="posts"
          icon="🗣️"
        />
        
        <LeaderboardSection
          title="Top Upvoted Tricks"
          data={leaderboards.top_upvoted_tricks}
          scoreLabel="upvotes"
          icon="🔥"
        />
      </LeaderboardsGrid>
    </LeaderboardsWrapper>
  );
};

export default Leaderboards;