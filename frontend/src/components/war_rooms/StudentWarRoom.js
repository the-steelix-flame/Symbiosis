import React from 'react';
import ActiveProjectsList from './ActiveProjectsList';
import MyProjectsList from './MyProjectsList'; 
import ClaimChallengeList from './ClaimChallengeList';
import QuizGame from '../gamification/QuizGame'; // 1. Import the QuizGame component
import './WarRoom.css';
// import './ProjectLists.css';

export default function StudentWarRoom() {
  return (
    <div className="war-room-container">
      <h1>Student Unity Desk</h1>
      <p>
        Welcome! Here you can see the projects you've joined and find new projects to contribute to.
      </p>
      <hr style={{ margin: '20px 0', borderTop: '1px solid #4a5568' }}/>
      <MyProjectsList />
      <ClaimChallengeList />
      <ActiveProjectsList />

      {/* 2. Add the QuizGame component here */}
      <QuizGame />
    </div>
  );
}