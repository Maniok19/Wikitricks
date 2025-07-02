import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Consistent Container
export const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

// Consistent Page Title
export const PageTitle = styled.h1`
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
`;

// Consistent Section Title
export const SectionTitle = styled.h2`
  font-family: var(--font-accent);
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`;

// Enhanced Button System
export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--btn-primary);
  border-radius: 4px;
  background: transparent;
  color: var(--btn-primary);
  font-size: 1rem;
  font-weight: 500;
  font-family: var(--font-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  min-width: 120px;

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

  &:hover {
    background: var(--btn-primary);
    color: var(--text-white);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px var(--shadow-medium);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    color: var(--text-muted);
    border-color: var(--text-muted);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.5;
    
    &:hover {
      background: transparent;
      color: var(--text-muted);
      transform: none;
      box-shadow: none;
    }
  }

  /* Variant styles */
  ${props => props.variant === 'primary' && `
    border-color: var(--btn-primary);
    color: var(--btn-primary);

    &:hover {
      background: var(--btn-primary);
      color: var(--text-white);
    }
  `}

  ${props => props.variant === 'secondary' && `
    border-color: var(--btn-secondary);
    color: var(--btn-secondary);

    &:hover {
      background: var(--btn-secondary);
      color: var(--text-white);
    }
  `}

  ${props => props.variant === 'danger' && `
    border-color: var(--btn-danger);
    color: var(--btn-danger);

    &:hover {
      background: var(--btn-danger);
      color: var(--text-white);
    }
  `}

  ${props => props.variant === 'success' && `
    border-color: var(--btn-success);
    color: var(--btn-success);

    &:hover {
      background: var(--btn-success);
      color: var(--text-white);
    }
  `}

  ${props => props.variant === 'shop' && `
    border: 2px solid transparent;
    background: linear-gradient(135deg, #ff6b35, #f7931e, #ffcc02);
    color: var(--text-white);
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);

    &:hover {
      background: linear-gradient(135deg, #e55a2b, #e8851a, #f0bb00);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
    }
  `}

  /* Size variants */
  ${props => props.size === 'small' && `
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    min-width: 80px;
  `}

  ${props => props.size === 'large' && `
    padding: 1rem 2rem;
    font-size: 1.125rem;
    min-width: 150px;
  `}

  /* Full width variant */
  ${props => props.fullWidth && `
    width: 100%;
    min-width: auto;
  `}

  /* Solid variant */
  ${props => props.solid && `
    background: var(--btn-primary);
    color: var(--text-white);

    &:hover {
      background: var(--btn-primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px var(--shadow-medium);
    }

    ${props.variant === 'danger' && `
      background: var(--btn-danger);
      &:hover { background: var(--btn-danger-hover); }
    `}

    ${props.variant === 'success' && `
      background: var(--btn-success);
      &:hover { background: var(--btn-success-hover); }
    `}

    ${props.variant === 'secondary' && `
      background: var(--btn-secondary);
      &:hover { background: var(--btn-secondary-hover); }
    `}
  `}
`;

// Link styled as button
export const LinkButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--btn-primary);
  border-radius: 4px;
  background: transparent;
  color: var(--btn-primary);
  font-size: 1rem;
  font-weight: 500;
  font-family: var(--font-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  min-width: 120px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

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

  &:hover {
    background: var(--btn-primary);
    color: var(--text-white);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px var(--shadow-medium);

    &::before {
      left: 100%;
    }
  }

  /* Apply same variants as Button */
  ${props => props.variant === 'danger' && `
    border-color: var(--btn-danger);
    color: var(--btn-danger);
    &:hover { background: var(--btn-danger); color: var(--text-white); }
  `}

  ${props => props.variant === 'success' && `
    border-color: var(--btn-success);
    color: var(--btn-success);
    &:hover { background: var(--btn-success); color: var(--text-white); }
  `}

  ${props => props.size === 'small' && `
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    min-width: 80px;
  `}

  ${props => props.size === 'large' && `
    padding: 1rem 2rem;
    font-size: 1.125rem;
    min-width: 150px;
  `}
`;

// Consistent Input
export const Input = styled.input`
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
    box-shadow: 0 0 5px var(--shadow-light);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

// Consistent Textarea
export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-light);
  border-radius: 4px;
  font-size: 1rem;
  font-family: var(--font-secondary);
  background-color: var(--background-secondary);
  color: var(--text-primary);
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--btn-primary);
    box-shadow: 0 0 5px var(--shadow-light);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

// Consistent Card
export const Card = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-light);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px var(--shadow-medium);
    border-color: var(--btn-primary);
  }
`;

// Consistent Form Container
export const FormContainer = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--background-secondary);
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow-medium);
`;

// Consistent Form Group
export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// Consistent Label
export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
  font-family: var(--font-secondary);
`;

// Consistent Error Message
export const ErrorMessage = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  background-color: rgba(220, 53, 69, 0.1);
  color: var(--btn-danger);
  border: 1px solid var(--btn-danger);
`;

// Consistent Success Message
export const SuccessMessage = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  background-color: rgba(5, 150, 105, 0.1);
  color: var(--btn-success);
  border: 1px solid var(--btn-success);
`;

// Consistent Loading Message
export const LoadingMessage = styled.div`
  text-align: center;
  color: var(--text-muted);
  font-size: 1.1rem;
  margin: 2rem 0;
`;

// Add Select component after the other form components
export const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background: var(--background);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: var(--font-primary);
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--btn-primary);
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
  }

  &:disabled {
    background: var(--bg-disabled);
    color: var(--text-muted);
    cursor: not-allowed;
  }

  option {
    background: var(--background);
    color: var(--text-primary);
    padding: 0.5rem;
  }
`;