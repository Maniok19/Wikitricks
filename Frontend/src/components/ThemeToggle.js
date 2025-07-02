import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const ToggleWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0; /* Prevent shrinking */
  
  @media (max-width: 768px) {
    gap: 0.25rem; /* Reduce gap on mobile */
  }
`;

const ToggleButton = styled.button`
  background: var(--background-secondary);
  border: 2px solid var(--border-light);
  border-radius: 25px;
  width: 60px;
  height: 30px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  padding: 2px;
  
  @media (max-width: 768px) {
    width: 50px; /* Smaller width on mobile */
    height: 26px; /* Smaller height on mobile */
  }
  
  ${props => props.isDarkMode ? `
    background: linear-gradient(45deg, var(--background-dark), var(--background-secondary));
    border-color: var(--btn-primary);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
    
    &:hover {
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    }
  ` : `
    background: var(--background-light);
    border-color: var(--border-medium);
    
    &:hover {
      border-color: var(--btn-primary);
      box-shadow: 0 2px 8px var(--shadow-light);
    }
  `}
`;

const ToggleSlider = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transform: translateX(${props => props.isDarkMode ? '28px' : '0px'});
  
  @media (max-width: 768px) {
    width: 20px; /* Smaller slider on mobile */
    height: 20px;
    font-size: 0.7rem; /* Smaller icon */
    transform: translateX(${props => props.isDarkMode ? '22px' : '0px'}); /* Adjust for smaller button */
  }
  
  ${props => props.isDarkMode ? `
    background: linear-gradient(45deg, var(--btn-primary), var(--secondary));
    color: var(--background);
    box-shadow: 
      0 0 10px var(--btn-primary),
      0 2px 4px rgba(0, 0, 0, 0.3);
  ` : `
    background: linear-gradient(45deg, var(--primary), var(--secondary));
    color: var(--text-white);
    box-shadow: 0 2px 4px var(--shadow-medium);
  `}
`;

const ThemeLabel = styled.span`
  font-family: var(--font-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.7rem; /* Smaller text on mobile */
    display: none; /* Hide label on very small screens if needed */
  }
  
  ${props => props.isDarkMode && `
    color: var(--btn-primary);
    text-shadow: 0 0 5px currentColor;
  `}
`;

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme, themeName } = useTheme();

  return (
    <ToggleWrapper>
      <ThemeLabel isDarkMode={isDarkMode}>
        {themeName}
      </ThemeLabel>
      <ToggleButton 
        onClick={toggleTheme}
        isDarkMode={isDarkMode}
        title={`Switch to ${isDarkMode ? 'Classic' : 'Dark'} theme`}
      >
        <ToggleSlider isDarkMode={isDarkMode}>
          {isDarkMode ? '🌃' : '☀️'}
        </ToggleSlider>
      </ToggleButton>
    </ToggleWrapper>
  );
};

export default ThemeToggle;