import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import {
  PageWrapper,
  PageTitle,
  Card,
  LoadingMessage,
  ErrorMessage,
  Button
} from './shared/StyledComponents';
import styled from 'styled-components';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  text-align: center;
  
  h3 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-family: var(--font-accent);
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: var(--btn-primary);
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    color: var(--text-muted);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ActivitySection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-family: var(--font-accent);
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-light);
`;

const DeleteButton = styled(Button)`
  background: var(--btn-danger);
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  
  &:hover {
    background: var(--btn-danger-hover);
  }
`;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const endpoints = {
        trick: `/admin/tricks/${id}`,
        comment: `/admin/comments/${id}`,
        topic: `/admin/forum/topics/${id}`,
        reply: `/admin/forum/replies/${id}`
      };
      
      await axiosInstance.delete(endpoints[type]);
      fetchDashboardData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.error || `Failed to delete ${type}`);
    }
  };

  if (!user || !user.is_admin) {
    return (
      <PageWrapper>
        <ErrorMessage>Access denied. Admin privileges required.</ErrorMessage>
      </PageWrapper>
    );
  }

  if (loading) return <LoadingMessage>Loading admin dashboard...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <PageWrapper>
      <PageTitle>Admin Dashboard</PageTitle>
      
      {dashboardData && (
        <>
          <DashboardGrid>
            <StatCard>
              <div className="stat-number">{dashboardData.stats.total_users}</div>
              <div className="stat-label">Total Users</div>
            </StatCard>
            
            <StatCard>
              <div className="stat-number">{dashboardData.stats.total_tricks}</div>
              <div className="stat-label">Total Tricks</div>
            </StatCard>
            
            <StatCard>
              <div className="stat-number">{dashboardData.stats.total_topics}</div>
              <div className="stat-label">Forum Topics</div>
            </StatCard>
            
            <StatCard>
              <div className="stat-number">{dashboardData.stats.total_comments}</div>
              <div className="stat-label">Comments</div>
            </StatCard>
          </DashboardGrid>

          <ActivitySection>
            <h3>Recent Tricks</h3>
            <ActivityList>
              {dashboardData.recent_activity.tricks.map(trick => (
                <ActivityItem key={trick.id}>
                  <div>
                    <strong>{trick.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(trick.created).toLocaleDateString()}
                    </div>
                  </div>
                  <DeleteButton onClick={() => handleDelete('trick', trick.id)}>
                    Delete
                  </DeleteButton>
                </ActivityItem>
              ))}
            </ActivityList>
          </ActivitySection>

          <ActivitySection>
            <h3>Recent Forum Topics</h3>
            <ActivityList>
              {dashboardData.recent_activity.topics.map(topic => (
                <ActivityItem key={topic.id}>
                  <div>
                    <strong>{topic.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      By {topic.username} on {new Date(topic.created).toLocaleDateString()}
                    </div>
                  </div>
                  <DeleteButton onClick={() => handleDelete('topic', topic.id)}>
                    Delete
                  </DeleteButton>
                </ActivityItem>
              ))}
            </ActivityList>
          </ActivitySection>
        </>
      )}
    </PageWrapper>
  );
};

export default AdminDashboard;