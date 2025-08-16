import React from 'react';
import ActiveProjectsList from './ActiveProjectsList';
import MyProjectsList from './MyProjectsList'; // Import the new component

export default function ResearcherWarRoom() {
  return (
    <div>
      <h1>Researcher War Room</h1>
      <p>
        Welcome! View your active research projects or join new initiatives from the list below.
      </p>
      <hr />

      {/* This component now shows the user's personal project list */}
      <MyProjectsList />

      <hr style={{ margin: '40px 0' }}/>
      
      {/* This component shows all active projects */}
      <ActiveProjectsList />
    </div>
  );
}