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
import EcoUploadsPage from './pages/EcoUploadsPage'; // This import is likely already here
import TrackSdgPage from './pages/TrackSdgPage';
import ContentCreationPage from './pages/ContentCreationPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          {/* --- NEW DIRECT ROUTE FOR CREATOR SECTION --- */}
          <Route path="/create-content" element={<ProtectedRoute><ContentCreationPage /></ProtectedRoute>} />
          <Route
            path="/threat-radar"
            element={ <ProtectedRoute> <ThreatRadarPage /> </ProtectedRoute> }
          />
          <Route path="/analysis" element={<AnalysisPage />} />

          {/* THIS IS THE MISSING PART 👇 */}
          <Route
            path="/eco-uploads" // Change this path
            element={
              <ProtectedRoute>
                <EcoUploadsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/track-sdg" element={<TrackSdgPage />} />
          {/* Route for creating content from a specific claim */}
          <Route path="/create-content/:claimId" element={<ProtectedRoute><ContentCreationPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;