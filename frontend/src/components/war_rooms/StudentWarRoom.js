import React from 'react';
import ActiveProjectsList from './ActiveProjectsList';
import MyProjectsList from './MyProjectsList'; // Import the new component

export default function StudentWarRoom() {
  return (
    <div>
      <h1>Student War Room</h1>
      <p>
        Welcome! Here you can see the projects you've joined and find new projects to contribute to.
      </p>
      <hr />
      
      {/* This component now shows the user's personal project list */}
      <MyProjectsList />

      <hr style={{ margin: '40px 0' }}/>
      
      {/* This component shows all active projects, allowing students to join new ones */}
      <ActiveProjectsList />
    </div>
  );
}