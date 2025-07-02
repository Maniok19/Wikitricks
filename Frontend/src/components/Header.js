import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const HeaderWrapper = styled.header`
  background: ${props => props.isDarkMode ? `
    linear-gradient(135deg, var(--background) 0%, var(--background-secondary) 100%)
  ` : `
    linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)
  `};
  color: var(--text-white);
  padding: 2rem;
  position: relative;
  box-shadow: 0 4px 16px var(--shadow-heavy);
  border-radius: 0 0 12px 12px;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  overflow: hidden; /* Add this to contain the neon line */

  ${props => props.isDarkMode ? `
    border-bottom: 2px solid var(--btn-primary);
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.8),
      0 0 40px rgba(0, 255, 255, 0.2);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, 
        var(--btn-primary), 
        var(--secondary), 
        var(--accent), 
        var(--gritty-yellow),
        var(--btn-primary)
      );
      animation: neonFlow 3s ease-in-out infinite;
      width: 100%; /* Ensure it doesn't exceed container width */
      box-sizing: border-box; /* Include any potential borders in width calculation */
    }

    @keyframes neonFlow {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }
  ` : `
    box-shadow: 0 2px 8px var(--shadow-medium);
  `}

  @media (max-width: 768px) {
    padding: 1rem;
    width: 100%;
    max-width: 100vw;
    overflow: hidden; /* Ensure overflow is hidden on mobile too */
  }
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    margin-bottom: 0;
    gap: 0.5rem; /* Reduce gap on mobile */
    padding: 0 0.5rem; /* Add padding to prevent cutoff */
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem; /* Reduce gap between logo and title */
    flex-shrink: 1; /* Allow shrinking if needed */
    min-width: 0; /* Allow text truncation if needed */
  }
`;

const Logo = styled.img`
  height: 60px;
  width: auto;
  ${props => props.isDarkMode ? `
    filter: 
      drop-shadow(0 0 8px var(--btn-primary))
      drop-shadow(0 0 16px rgba(0, 255, 255, 0.5));
    transition: all 0.3s ease;

    &:hover {
      filter: 
        drop-shadow(0 0 12px var(--secondary))
        drop-shadow(0 0 24px rgba(255, 0, 255, 0.7));
      transform: rotate(-2deg) scale(1.05);
    }
  ` : `
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  `}

  @media (max-width: 768px) {
    height: 40px;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-family: var(--font-accent);
  color: var(--text-white);
  ${props => props.isDarkMode ? `
    text-shadow: 
      0 0 10px var(--btn-primary),
      0 0 20px var(--btn-primary),
      0 0 30px var(--btn-primary),
      2px 2px 0px var(--secondary);
    transform: rotate(-1deg);
    transition: all 0.3s ease;

    &:hover {
      transform: rotate(1deg) scale(1.02);
      text-shadow: 
        0 0 10px var(--secondary),
        0 0 20px var(--secondary),
        0 0 30px var(--secondary),
        2px 2px 0px var(--btn-primary);
    }
  ` : `
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }
  `}

  @media (max-width: 768px) {
    font-size: 1.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    /* Reduce neon effects on mobile to prevent square background */
    ${props => props.isDarkMode ? `
      text-shadow: 
        0 0 8px var(--btn-primary),
        0 0 12px var(--btn-primary);
      transform: none; /* Remove rotation on mobile */
      
      &:hover {
        transform: none; /* Remove hover effects on mobile */
        text-shadow: 
          0 0 8px var(--btn-primary),
          0 0 12px var(--btn-primary);
      }
    ` : `
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      
      &:hover {
        transform: none;
      }
    `}
  }
`;

const MobileMenuToggle = styled.button`
  display: none;
  background: transparent;
  border: 2px solid ${props => props.isDarkMode ? 'var(--btn-primary)' : 'rgba(255, 255, 255, 0.8)'};
  color: var(--text-white);
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
  flex-shrink: 0; /* Prevent shrinking */

  ${props => props.isDarkMode ? `
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
    
    &:hover {
      border-color: var(--secondary);
      box-shadow: 0 0 15px var(--secondary);
    }
  ` : `
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 1);
    }
  `}

  @media (max-width: 768px) {
    display: block;
    padding: 0.4rem; /* Slightly smaller padding */
    min-width: 40px; /* Ensure minimum width */
    height: 40px; /* Fixed height */
  }
`;

const HamburgerIcon = styled.div`
  width: 24px;
  height: 18px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.3s ease-in-out;

  span {
    display: block;
    position: absolute;
    height: 3px;
    width: 100%;
    background: var(--text-white);
    border-radius: 3px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: 0.25s ease-in-out;

    &:nth-child(1) {
      top: ${props => props.isOpen ? '8px' : '0px'};
      transform: ${props => props.isOpen ? 'rotate(135deg)' : 'rotate(0deg)'};
    }

    &:nth-child(2) {
      top: 8px;
      opacity: ${props => props.isOpen ? '0' : '1'};
      left: ${props => props.isOpen ? '-30px' : '0'};
    }

    &:nth-child(3) {
      top: ${props => props.isOpen ? '8px' : '16px'};
      transform: ${props => props.isOpen ? 'rotate(-135deg)' : 'rotate(0deg)'};
    }
  }
`;

const Nav = styled.nav`
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: ${props => props.isDarkMode ? `
      linear-gradient(135deg, var(--background) 0%, var(--background-secondary) 100%)
    ` : `
      linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)
    `};
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    transition: transform 0.3s ease-in-out;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    
    ${props => props.isDarkMode && `
      box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
    `}
  }
`;

const NavList = styled.ul`
  list-style-type: none;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    margin: 0;
    width: 100%;
    max-width: 300px;
  }
`;

const MainNavItems = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    align-items: center;
  }
`;

const AuthNavItems = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    align-items: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
  }
`;

const NavItem = styled.li`
  position: relative;

  a, button {
    display: block;
    color: var(--text-white);
    text-decoration: none;
    padding: 12px 20px;
    font-family: var(--font-secondary);
    font-weight: 500;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: transparent;
    border: 2px solid ${props => props.isDarkMode ? 'var(--btn-primary)' : 'rgba(255, 255, 255, 0.8)'};
    border-radius: 4px;
    margin-right: 4px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    ${props => props.isDarkMode ? `
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }

      &:hover {
        border-color: var(--secondary);
        color: var(--secondary);
        background: rgba(255, 0, 255, 0.1);
        transform: translateY(-2px);
        box-shadow: 
          0 0 20px var(--secondary),
          0 0 40px rgba(255, 0, 255, 0.3),
          0 4px 12px rgba(0, 0, 0, 0.5);

        &::before {
          left: 100%;
        }
      }
    ` : `
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 1);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
    `}

    &:active {
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      padding: 16px 32px;
      font-size: 1.2rem;
      margin-right: 0;
      width: 200px;
      text-align: center;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
`;

const Button = styled.button`
  background: transparent;
  border: 2px solid ${props => props.isDarkMode ? 'var(--btn-danger)' : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.isDarkMode ? 'var(--btn-danger)' : 'var(--text-white)'};
  cursor: pointer;
  font-family: var(--font-secondary);
  display: block;
  padding: 12px 20px;
  font-weight: 500;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  margin-right: 4px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  width: auto;
  min-width: 120px;
  min-height: 48px; /* Ensures consistent height */
  text-align: center;
  box-sizing: border-box;

  ${props => props.isDarkMode ? `
    box-shadow: 0 0 10px rgba(255, 102, 0, 0.3);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 102, 0, 0.2), transparent);
      transition: left 0.5s ease;
    }

    &:hover {
      border-color: var(--btn-danger-hover);
      color: var(--btn-danger-hover);
      background: rgba(255, 102, 0, 0.1);
      transform: translateY(-2px);
      box-shadow: 
        0 0 20px var(--btn-danger-hover),
        0 0 40px rgba(255, 102, 0, 0.3),
        0 4px 12px rgba(0, 0, 0, 0.5);

      &::before {
        left: 100%;
      }
    }
  ` : `
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 1);
      color: var(--text-white);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  `}

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 16px 32px;
    font-size: 1.2rem;
    margin-right: 0;
    width: 200px;
    min-height: 56px; /* Match mobile nav item height */
    text-align: center;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const MobileTopControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 3rem;

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    gap: 0.5rem; /* Reduce gap on mobile */
  }
`;

const Header = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    closeMobileMenu();
  };

  return (
    <HeaderWrapper isDarkMode={isDarkMode}>
      <HeaderTop>
        <LogoSection>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.5rem' }} onClick={closeMobileMenu}>
            <Logo src="/logo_image.png" alt="WikiTricks Logo" isDarkMode={isDarkMode} />
            <Title isDarkMode={isDarkMode}>WIKITRICKS</Title>
          </Link>
        </LogoSection>
        
        <MobileControls>
          <ThemeToggle />
          <MobileMenuToggle onClick={toggleMobileMenu} isDarkMode={isDarkMode}>
            <HamburgerIcon isOpen={isMobileMenuOpen}>
              <span></span>
              <span></span>
              <span></span>
            </HamburgerIcon>
          </MobileMenuToggle>
        </MobileControls>
      </HeaderTop>
      
      <Nav isOpen={isMobileMenuOpen} isDarkMode={isDarkMode}>
        <MobileTopControls>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={closeMobileMenu}>
            <Logo src="/logo_image.png" alt="WikiTricks Logo" isDarkMode={isDarkMode} />
            <Title isDarkMode={isDarkMode}>WIKITRICKS</Title>
          </Link>
          <MobileMenuToggle onClick={toggleMobileMenu} isDarkMode={isDarkMode}>
            <HamburgerIcon isOpen={isMobileMenuOpen}>
              <span></span>
              <span></span>
              <span></span>
            </HamburgerIcon>
          </MobileMenuToggle>
        </MobileTopControls>

        <NavList>
          <MainNavItems>
            <NavItem isDarkMode={isDarkMode}><Link to="/" onClick={closeMobileMenu}>HOME</Link></NavItem>
            <NavItem isDarkMode={isDarkMode}><Link to="/tricks" onClick={closeMobileMenu}>TRICKS</Link></NavItem>
            <NavItem isDarkMode={isDarkMode}><Link to="/forum" onClick={closeMobileMenu}>FORUM</Link></NavItem>
            <NavItem isDarkMode={isDarkMode}><Link to="/skateparks" onClick={closeMobileMenu}>SPOTS</Link></NavItem>
            <NavItem isDarkMode={isDarkMode}><Link to="/leaderboards" onClick={closeMobileMenu}>LEADERBOARDS</Link></NavItem>
            <NavItem isDarkMode={isDarkMode}>
              <a 
                href="https://www.redbubble.com/fr/i/sweat/Wikitricks-par-maniok/171683802.0VJPW" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
              >
                SHOP
              </a>
            </NavItem>
          </MainNavItems>
          
          <AuthNavItems>
            {user ? (
              <>
                <NavItem isDarkMode={isDarkMode}><Link to="/profile" onClick={closeMobileMenu}>PROFILE</Link></NavItem>
                <NavItem isDarkMode={isDarkMode}>
                  <a href="#" onClick={handleLogout}>LOGOUT</a>
                </NavItem>
              </>
            ) : (
              <>
                <NavItem isDarkMode={isDarkMode}><Link to="/login" onClick={closeMobileMenu}>LOGIN</Link></NavItem>
                <NavItem isDarkMode={isDarkMode}><Link to="/register" onClick={closeMobileMenu}>REGISTER</Link></NavItem>
              </>
            )}
          </AuthNavItems>
        </NavList>
      </Nav>
    </HeaderWrapper>
  );
};

export default Header;
