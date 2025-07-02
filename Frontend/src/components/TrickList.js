import React from 'react';
import TrickCard from './TrickCard';

const TrickList = ({ tricks }) => {
  return (
    <div className="trick-list">
      {tricks.map(trick => (
        <TrickCard key={trick.id} trick={trick} />
      ))}
    </div>
  );
};

export default TrickList;
