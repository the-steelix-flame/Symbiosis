import React from 'react';
import ActiveProjectsList from './ActiveProjectsList';
import MyProjectsList from './MyProjectsList';
import ClaimChallengeList from './ClaimChallengeList';
import QuizGame from '../gamification/QuizGame'; // 1. Import the QuizGame component
import './WarRoom.css';

export default function CommunityWarRoom() {
  return (
    <div className="war-room-container">
      <h1>Community Unity Desk</h1>
      <p>
        Welcome! See the community projects you are a part of, or join new projects from the list below.
      </p>
      <hr style={{ margin: '20px 0', borderTop: '1px solid #4a5568' }}/>
      <MyProjectsList />
      <ActiveProjectsList />
      <ClaimChallengeList />

      {/* 2. Add the QuizGame component here */}
      <QuizGame />
    </div>
  );
}