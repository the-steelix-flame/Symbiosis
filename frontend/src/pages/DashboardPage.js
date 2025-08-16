import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Import all the specific War Room components
import GovernmentWarRoom from '../components/war_rooms/GovernmentWarRoom';
import NGOWarRoom from '../components/war_rooms/NGOWarRoom';
import ResearcherWarRoom from '../components/war_rooms/ResearcherWarRoom';
import CommunityWarRoom from '../components/war_rooms/CommunityWarRoom';
import StudentWarRoom from '../components/war_rooms/StudentWarRoom';

export default function DashboardPage() {
  const { currentUserRole } = useAuth();

  const renderWarRoom = () => {
    // This switch statement checks the user's role and returns the correct component.
    switch (currentUserRole) {
      case 'gov':
        return <GovernmentWarRoom />;
      case 'ngo':
        return <NGOWarRoom />;
      case 'researcher':
        return <ResearcherWarRoom />;
      case 'community':
        return <CommunityWarRoom />;
      case 'student':
        return <StudentWarRoom />;
      default:
        // Show a loading or default state while the role is being determined
        return <p>Loading your War Room...</p>;
    }
  };

  const containerStyle = { padding: '20px' };

  return (
    <div style={containerStyle}>
      {renderWarRoom()}
    </div>
  );
}