import React from 'react';
import ProjectBoard from './ProjectBoard';
import ClaimChallengeList from './ClaimChallengeList'; // 1. Import the component
import './WarRoom.css';

export default function NGOWarRoom() {
  return (
    <div className="war-room-container">
      <h1>NGO Unity Desk</h1>
      <p>Tools for volunteer coordination, project management, and data validation will be here.</p>
      <hr />
      <ProjectBoard />
      
      {/* 2. Add the component here */}
      <ClaimChallengeList />
    </div>
  );
}