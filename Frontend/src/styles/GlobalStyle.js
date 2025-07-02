import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Oswald:wght@300;400;500;600;700&family=Permanent+Marker&display=swap');

  body {
    margin: 0;
    padding: 0;
    font-family: var(--font-primary);
    background: var(--background);
    background-attachment: fixed;
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden; /* This should already be there */
    transition: all 0.3s ease;
    width: 100%; /* Add this */
    max-width: 100vw; /* Add this to prevent overflow */
  }

  * {
    box-sizing: border-box; /* Add this if not already present */
  }

  /* Add these mobile-specific fixes */
  @media (max-width: 768px) {
    body {
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
    }
    
    /* Ensure no element exceeds viewport width */
    * {
      max-width: 100%;
    }
  }

  /* Consistent Button Styles */
  .btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid currentColor;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    font-family: var(--font-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: transparent;
    position: relative;
    overflow: hidden;
    
    ${props => props.isDarkMode && `
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s ease;
      }
      
      &:hover::before {
        left: 100%;
      }
    `}
  }

  .btn-primary {
    color: var(--btn-primary);
    border-color: var(--btn-primary);
    ${props => props.isDarkMode ? `
      box-shadow: var(--shadow-neon);
      
      &:hover {
        color: var(--btn-primary-hover);
        border-color: var(--btn-primary-hover);
        background: rgba(255, 0, 255, 0.1);
        transform: translateY(-2px);
        box-shadow: 
          0 0 20px var(--btn-primary-hover),
          0 0 40px var(--btn-primary-hover),
          0 4px 12px rgba(255, 0, 255, 0.3);
      }
    ` : `
      &:hover {
        background: var(--btn-primary);
        color: var(--text-white);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--shadow-medium);
      }
    `}
  }

  .btn-secondary {
    color: var(--btn-secondary);
    border-color: var(--btn-secondary);
    ${props => props.isDarkMode ? `
      box-shadow: 0 0 10px var(--btn-secondary-hover);
      
      &:hover {
        color: var(--btn-secondary-hover);
        border-color: var(--btn-secondary-hover);
        background: rgba(0, 255, 0, 0.1);
        transform: translateY(-2px);
        box-shadow: 
          0 0 20px var(--btn-secondary-hover),
          0 0 40px var(--btn-secondary-hover);
      }
    ` : `
      &:hover {
        background: var(--btn-secondary);
        color: var(--text-white);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--shadow-medium);
      }
    `}
  }

  .btn-danger {
    color: var(--btn-danger);
    border-color: var(--btn-danger);
    ${props => props.isDarkMode ? `
      box-shadow: 0 0 10px var(--btn-danger);
      
      &:hover {
        color: var(--btn-danger-hover);
        border-color: var(--btn-danger-hover);
        background: rgba(255, 102, 0, 0.1);
        transform: translateY(-2px);
        box-shadow: 
          0 0 20px var(--btn-danger-hover),
          0 0 40px var(--btn-danger-hover);
      }
    ` : `
      &:hover {
        background: var(--btn-danger);
        color: var(--text-white);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--shadow-medium);
      }
    `}
  }

  .btn-success {
    color: var(--btn-success);
    border-color: var(--btn-success);
    ${props => props.isDarkMode ? `
      box-shadow: 0 0 10px var(--btn-success);
      
      &:hover {
        background: rgba(0, 255, 0, 0.1);
        transform: translateY(-2px);
        box-shadow: 
          0 0 20px var(--btn-success),
          0 0 40px var(--btn-success);
      }
    ` : `
      &:hover {
        background: var(--btn-success);
        color: var(--text-white);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px var(--shadow-medium);
      }
    `}
  }

  .btn:disabled {
    color: var(--text-muted);
    border-color: var(--text-muted);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.5;
  }

  /* Consistent Form Elements */
  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border-light);
    border-radius: 4px;
    font-size: 1rem;
    font-family: var(--font-secondary);
    background-color: var(--background-secondary);
    color: var(--text-primary);
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--btn-primary);
      ${props => props.isDarkMode ? `
        background-color: rgba(0, 255, 255, 0.05);
        box-shadow: 
          0 0 10px var(--btn-primary),
          0 0 20px rgba(0, 255, 255, 0.2);
      ` : `
        background-color: var(--background);
        box-shadow: 0 0 5px var(--shadow-light);
      `}
    }
    
    &::placeholder {
      color: var(--text-muted);
    }
  }

  .form-textarea {
    min-height: 120px;
    resize: vertical;
  }

  /* Consistent Card Styles */
  .card {
    background: var(--background-secondary);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px var(--shadow-light);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    ${props => props.isDarkMode ? `
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.5),
        0 0 20px rgba(0, 255, 255, 0.1);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--btn-primary), var(--secondary), var(--accent));
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      &:hover {
        transform: translateY(-4px);
        border-color: var(--btn-primary);
        box-shadow: 
          0 4px 16px rgba(0, 0, 0, 0.7),
          0 0 30px rgba(0, 255, 255, 0.3),
          0 0 60px rgba(0, 255, 255, 0.1);
        
        &::before {
          opacity: 1;
        }
      }
    ` : `
      box-shadow: 0 2px 8px var(--shadow-light);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px var(--shadow-medium);
        border-color: var(--btn-primary);
      }
    `}
  }

  /* Typography Utilities */
  .text-primary { color: var(--text-primary); }
  .text-secondary { color: var(--text-secondary); }
  .text-muted { color: var(--text-muted); }
  .text-light { color: var(--text-light); }
  .text-white { color: var(--text-white); }
  .text-neon { 
    color: var(--text-neon);
    ${props => props.isDarkMode && 'text-shadow: 0 0 10px currentColor;'}
  }
  .text-center { text-align: center; }

  /* Theme specific elements */
  .graffiti-text {
    font-family: var(--font-accent);
    ${props => props.isDarkMode ? `
      color: var(--secondary);
      text-shadow: 
        0 0 10px currentColor,
        0 0 20px currentColor,
        0 0 30px currentColor;
    ` : `
      color: var(--primary);
      text-shadow: 2px 2px 4px var(--shadow-light);
    `}
  }

  .neon-glow {
    ${props => props.isDarkMode ? `
      box-shadow: var(--shadow-neon);
    ` : `
      box-shadow: 0 2px 8px var(--shadow-medium);
    `}
  }

  /* Consistent Page Layouts */
  .page-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%; /* Add this */
    
    @media (max-width: 768px) {
      padding: 1rem; /* Reduce padding on mobile */
      max-width: 100vw;
    }
  }

  .page-title {
    font-family: var(--font-accent);
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2.5rem;
    ${props => props.isDarkMode ? `
      text-shadow: 
        0 0 10px var(--btn-primary),
        0 0 20px var(--btn-primary);
    ` : `
      text-shadow: 2px 2px 4px var(--shadow-light);
    `}
  }

  .section-title {
    font-family: var(--font-accent);
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }

  /* Consistent Error/Success Messages */
  .message {
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
  }

  .message-error {
    background-color: rgba(220, 53, 69, 0.1);
    color: var(--btn-danger);
    border: 1px solid var(--btn-danger);
  }

  .message-success {
    background-color: rgba(5, 150, 105, 0.1);
    color: var(--btn-success);
    border: 1px solid var(--btn-success);
  }

  .message-info {
    background-color: rgba(37, 99, 235, 0.1);
    color: var(--btn-primary);
    border: 1px solid var(--btn-primary);
  }

  /* Loading States */
  .loading {
    text-align: center;
    color: var(--text-muted);
    font-size: 1.1rem;
    margin: 2rem 0;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--background);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--btn-primary);
    border-radius: 4px;
    ${props => props.isDarkMode && 'box-shadow: 0 0 10px var(--btn-primary);'}
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--btn-primary-hover);
    ${props => props.isDarkMode && 'box-shadow: 0 0 10px var(--btn-primary-hover);'}
  }

  /* Selection styling */
  ::selection {
    ${props => props.isDarkMode ? `
      background: rgba(0, 255, 255, 0.3);
      color: var(--text-white);
    ` : `
      background: rgba(37, 99, 235, 0.3);
      color: var(--text-white);
    `}
  }

  /* Link styling */
  a {
    color: var(--btn-primary);
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--btn-primary-hover);
      ${props => props.isDarkMode && 'text-shadow: 0 0 10px currentColor;'}
    }
  }
`;