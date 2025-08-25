import React from 'react';
import ThreatRadar from '../components/war_rooms/ThreatRadar.js';
import './ThreatRadarPage.css'; // Import the new CSS file

export default function ThreatRadarPage() {
    return (
        // Use the new class for styling instead of the inline style
        <div className="threat-radar-page-container">
            <ThreatRadar />
        </div>
    );
}