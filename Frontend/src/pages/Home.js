import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axiosInstance from '../utils/axios';
import { LinkButton } from '../components/shared/StyledComponents';

const HomeWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeroSection = styled.section`
  background: 
    linear-gradient(135deg, var(--background) 0%, var(--background-secondary) 100%);
  color: var(--text-white);
  padding: 4rem 2rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
  border: 2px solid var(--btn-primary);
  box-shadow: 
    0 8px 32px var(--shadow-heavy),
    0 0 40px var(--shadow-medium);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(45deg, transparent 30%, var(--shadow-light) 50%, transparent 70%),
      linear-gradient(-45deg, transparent 30%, var(--shadow-light) 50%, transparent 70%);
    pointer-events: none;
    animation: streetLights 4s ease-in-out infinite alternate;
  }

  @keyframes streetLights {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const HeroLogo = styled.img`
  height: 80px;
  width: auto;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    height: 60px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  opacity: 0.9;
  color: var(--text-secondary);
`;

const DailySection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 0.5rem;
  }
`;

const DailyCard = styled.div`
  background: var(--background-secondary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 
    0 4px 16px var(--shadow-medium),
    0 0 20px var(--shadow-light);
  border: 1px solid var(--border-light);
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
    background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 8px 24px var(--shadow-heavy),
      0 0 30px var(--shadow-medium);
    border-color: var(--btn-primary);
    
    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    text-align: center;
    margin: 0 auto;
    max-width: 100%;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const DailyTitle = styled.h3`
  font-family: var(--font-accent);
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
    font-size: 1.2rem;
    text-align: center;
  }
`;

const DailyIcon = styled.span`
  display: none;
`;

const TrickOfTheDay = styled.div`
  h4 {
    color: var(--btn-primary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .difficulty {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 1rem;
    
    &.beginner { background: var(--btn-success); color: white; }
    &.intermediate { background: var(--gritty-yellow); color: white; }
    &.advanced { background: var(--secondary); color: white; }
    &.expert { background: var(--btn-danger); color: white; }
  }
  
  @media (max-width: 768px) {
    text-align: center;
    
    h4 {
      font-size: 1.1rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const VideoThumbnail = styled.div`
  width: 100%;
  height: 180px;
  background: var(--bg-darker);
  border-radius: 8px;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  
  @media (max-width: 768px) {
    height: 200px;
    margin: 1rem 0;
  }
`;

const ForumOfTheDay = styled.div`
  h4 {
    color: var(--btn-primary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .meta {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
  }
  
  @media (max-width: 768px) {
    text-align: center;
    
    h4 {
      font-size: 1.1rem;
    }
    
    p {
      font-size: 0.9rem;
    }
    
    .meta {
      font-size: 0.8rem;
    }
  }
`;

const SpotOfTheDay = styled.div`
  h4 {
    color: var(--btn-primary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .address {
    font-size: 0.9rem;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 768px) {
    text-align: center;
    
    h4 {
      font-size: 1.1rem;
    }
    
    p {
      font-size: 0.9rem;
    }
    
    .address {
      font-size: 0.8rem;
    }
  }
`;

const ViewMoreButton = styled(Link)`
  display: inline-block;
  color: var(--btn-primary);
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border: 2px solid var(--btn-primary);
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--btn-primary);
    color: var(--text-white);
  }
  
  @media (max-width: 768px) {
    display: block;
    text-align: center;
    margin: 1rem auto 0;
    max-width: 200px;
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
  }
`;

const LoadingCard = styled.div`
  background: var(--background-secondary);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    font-size: 0.9rem;
  }
`;

const ShopSection = styled.section`
  background: linear-gradient(135deg, var(--btn-danger) 0%, var(--secondary) 100%);
  border-radius: 12px;
  padding: 3rem 2rem;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  color: var(--text-white);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ShopContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ShopImageContainer = styled.div`
  position: relative;
  z-index: 1;
`;

const ShopImage = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05) rotate(2deg);
  }
`;

const ShopText = styled.div`
  text-align: left;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const ShopTitle = styled.h2`
  font-family: var(--font-accent);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ShopDescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
`;

const QuickLinksSection = styled.section`
  margin-bottom: 3rem;
  
  h2 {
    font-family: var(--font-accent);
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
  }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const QuickLinkCard = styled(Link)`
  display: block;
  background: var(--background-secondary);
  border: 2px solid var(--border-light);
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  text-align: center;
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
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    border-color: var(--btn-primary);
    box-shadow: 0 8px 24px var(--shadow-heavy);
    
    &::before {
      transform: scaleX(1);
    }
    
    .icon {
      transform: scale(1.2);
    }
  }
  
  .icon {
    display: block;
    width: 50px;
    height: 50px;
    background: var(--btn-primary);
    border-radius: 50%;
    margin: 0 auto 1rem;
    transition: transform 0.3s ease;
    position: relative;
    
    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5rem;
    }
  }
  
  /* Specific icons for each card */
  &[href="/create-trick"] .icon::before {
    content: '🛹';
  }
  
  &[href="/forum"] .icon::before {
    content: '💬';
  }
  
  &[href="/skateparks"] .icon::before {
    content: '📍';
  }
  
  &[href="/create-skatepark"] .icon::before {
    content: '➕';
  }
  
  &[href="/leaderboards"] .icon::before {
    content: '🏆';
  }
  
  &[href="/game"] .icon {
    background-image: url('/public/jumpandlearn.png');
    background-size: cover;
  }
  
  .title {
    font-family: var(--font-accent);
    font-size: 1.2rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .description {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    
    .icon {
      width: 40px;
      height: 40px;
      
      &::before {
        font-size: 1.2rem;
      }
    }
    
    .title {
      font-size: 1.1rem;
    }
    
    .description {
      font-size: 0.8rem;
    }
  }
`;

const Home = () => {
  const [trickOfTheDay, setTrickOfTheDay] = useState(null);
  const [forumOfTheDay, setForumOfTheDay] = useState(null);
  const [spotOfTheDay, setSpotOfTheDay] = useState(null);
  const [stats, setStats] = useState({
    totalTricks: 0,
    totalTopics: 0,
    totalSpots: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchDailyContent = async () => {
      try {
        setLoading(true);
        
        // Fetch all daily content in parallel
        const [tricksRes, topicsRes, spotsRes] = await Promise.all([
          axiosInstance.get('/tricks'),
          axiosInstance.get('/forum/topics'),
          axiosInstance.get('/skateparks')
        ]);

        // Set random "of the day" content
        if (tricksRes.data.length > 0) {
          const randomTrick = tricksRes.data[Math.floor(Math.random() * tricksRes.data.length)];
          setTrickOfTheDay(randomTrick);
        }

        if (topicsRes.data.length > 0) {
          const randomTopic = topicsRes.data[Math.floor(Math.random() * topicsRes.data.length)];
          setForumOfTheDay(randomTopic);
        }

        if (spotsRes.data.length > 0) {
          const randomSpot = spotsRes.data[Math.floor(Math.random() * spotsRes.data.length)];
          setSpotOfTheDay(randomSpot);
        }

        // Set stats
        setStats({
          totalTricks: tricksRes.data.length,
          totalTopics: topicsRes.data.length,
          totalSpots: spotsRes.data.length,
          totalUsers: 0 // You might want to add an endpoint for this
        });

      } catch (error) {
        console.error('Failed to fetch daily content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyContent();
  }, []);

  return (
    <HomeWrapper>
      <HeroSection>
        <HeroLogo src="/logo_image.png" alt="WikiTricks Logo" />
        <HeroSubtitle>
          Your ultimate skateboarding community. Learn tricks, discover spots, connect with skaters.
        </HeroSubtitle>
        {!user ? (
          <LinkButton to="/register" size="large" variant="primary">
            JOIN THE CREW
          </LinkButton>
        ) : (
          <LinkButton to="/create-trick" size="large" variant="primary">
            DROP A NEW TRICK
          </LinkButton>
        )}
      </HeroSection>

      <DailySection>
        <DailyCard>
          <DailyTitle>
            <DailyIcon></DailyIcon>
            Trick of the Day
          </DailyTitle>
          {loading ? (
            <LoadingCard>Loading trick...</LoadingCard>
          ) : trickOfTheDay ? (
            <TrickOfTheDay>
              <h4>{trickOfTheDay.title}</h4>
              <span className={`difficulty ${trickOfTheDay.difficulty}`}>
                {trickOfTheDay.difficulty}
              </span>
              <p>{trickOfTheDay.description}</p>
              {trickOfTheDay.video_url && (
                <VideoThumbnail>
                  <iframe
                    src={trickOfTheDay.video_url}
                    title={trickOfTheDay.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </VideoThumbnail>
              )}
              <ViewMoreButton to={`/trick/${trickOfTheDay.id}`}>
                Learn This Trick
              </ViewMoreButton>
            </TrickOfTheDay>
          ) : (
            <p>No tricks available</p>
          )}
        </DailyCard>

        <DailyCard>
          <DailyTitle>
            <DailyIcon></DailyIcon>
            Hot Topic
          </DailyTitle>
          {loading ? (
            <LoadingCard>Loading topic...</LoadingCard>
          ) : forumOfTheDay ? (
            <ForumOfTheDay>
              <h4>{forumOfTheDay.title}</h4>
              {forumOfTheDay.description && (
                <p>{forumOfTheDay.description}</p>
              )}
              <div className="meta">
                By {forumOfTheDay.username} • {forumOfTheDay.reply_count || 0} replies
              </div>
              <ViewMoreButton to={`/forum/topic/${forumOfTheDay.id}`}>
                Join Discussion
              </ViewMoreButton>
            </ForumOfTheDay>
          ) : (
            <p>No topics available</p>
          )}
        </DailyCard>

        <DailyCard>
          <DailyTitle>
            <DailyIcon></DailyIcon>
            Spot of the Day
          </DailyTitle>
          {loading ? (
            <LoadingCard>Loading spot...</LoadingCard>
          ) : spotOfTheDay ? (
            <SpotOfTheDay>
              <h4>{spotOfTheDay.name}</h4>
              <div className="address">{spotOfTheDay.address}</div>
              <p>{spotOfTheDay.description}</p>
              <ViewMoreButton to="/skateparks">
                Explore More Spots
              </ViewMoreButton>
            </SpotOfTheDay>
          ) : (
            <p>No spots available</p>
          )}
        </DailyCard>
      </DailySection>

      <ShopSection>
        <ShopContent>
          <ShopImageContainer>
            <ShopImage src="/shop_image.png" alt="WikiTricks Shop" />
          </ShopImageContainer>
          <ShopText>
            <ShopTitle>🛍️ WIKITRICKS SHOP</ShopTitle>
            <ShopDescription>
              Rep the crew with our exclusive skateboarding clothes! 
              High-quality, designed by skaters, for skaters.
            </ShopDescription>
            <LinkButton 
              as="a" 
              href="https://www.redbubble.com/fr/i/sweat/Wikitricks-par-maniok/171683802.0VJPW"
              target="_blank"
              rel="noopener noreferrer"
              variant="shop" 
              size="large"
            >
              🛒 Visit Shop
            </LinkButton>
          </ShopText>
        </ShopContent>
      </ShopSection>

      <QuickLinksSection>
        <h2>Quick Access</h2>
        <QuickLinksGrid>
          <QuickLinkCard to="/create-trick">
            <span className="icon"></span>
            <div className="title">Share Trick</div>
            <div className="description">Show your skills</div>
          </QuickLinkCard>
          
          <QuickLinkCard to="/forum">
            <span className="icon"></span>
            <div className="title">Forum</div>
            <div className="description">Join discussions</div>
          </QuickLinkCard>
          
          <QuickLinkCard to="/skateparks">
            <span className="icon"></span>
            <div className="title">Find Spots</div>
            <div className="description">Discover new places</div>
          </QuickLinkCard>
          
          <QuickLinkCard to="/create-skatepark">
            <span className="icon"></span>
            <div className="title">Add Spot</div>
            <div className="description">Share new locations</div>
          </QuickLinkCard>
          
          <QuickLinkCard to="/leaderboards">
            <span className="icon"></span>
            <div className="title">Leaderboards</div>
            <div className="description">Top contributors</div>
          </QuickLinkCard>
          
          <QuickLinkCard as="a" href="https://jumpandlearn.netlify.app" target="_blank" rel="noopener noreferrer">
            <span className="icon" style={{ backgroundImage: 'url(/jumpandlearn.png)', backgroundSize: 'cover' }}></span>
            <div className="title">Play Jump And Learn</div>
            <div className="description">Best game ever</div>
          </QuickLinkCard>
        </QuickLinksGrid>
      </QuickLinksSection>
    </HomeWrapper>
  );
};

export default Home;