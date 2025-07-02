import React from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  margin: 2rem 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2c3e50;
  }
`;

const SearchBar = ({ onSearch, placeholder = "Search for a trick..." }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder={placeholder}
        onChange={handleChange}
      />
    </SearchContainer>
  );
};

export default SearchBar;