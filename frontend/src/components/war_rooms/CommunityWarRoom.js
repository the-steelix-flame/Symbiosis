import React from 'react';
import ActiveProjectsList from './ActiveProjectsList';
import MyProjectsList from './MyProjectsList'; // Import the new component

export default function CommunityWarRoom() {
  return (
    <div>
      <h1>Community War Room</h1>
      <p>
        Welcome! See the community projects you are a part of, or join new projects from the list below.
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