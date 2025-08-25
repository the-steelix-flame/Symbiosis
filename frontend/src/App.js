import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute'; 

// Import Pages
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; 
import ProfilePage from './pages/ProfilePage';
import AnalysisPage from './pages/AnalysisPage';
import ThreatRadarPage from './pages/ThreatRadarPage';
import EcoUploadsPage from './pages/EcoUploadsPage';
import TrackSdgPage from './pages/TrackSdgPage';
import ContentCreationPage from './pages/ContentCreationPage';
import './App.css'; // Make sure this line is here

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        {/* V-- Add this div wrapper --V */}
        <div className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            <Route path="/create-content" element={<ProtectedRoute><ContentCreationPage /></ProtectedRoute>} />
            <Route
              path="/threat-radar"
              element={ <ProtectedRoute> <ThreatRadarPage /> </ProtectedRoute> }
            />
            <Route path="/analysis" element={<AnalysisPage />} />

            <Route
              path="/eco-uploads"
              element={
                <ProtectedRoute>
                  <EcoUploadsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/track-sdg" element={<TrackSdgPage />} />
            <Route path="/create-content/:claimId" element={<ProtectedRoute><ContentCreationPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;