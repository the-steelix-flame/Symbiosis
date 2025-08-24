import React from 'react';
import ThreatRadar from '../components/war_rooms/ThreatRadar.js';

export default function ThreatRadarPage() {
    const containerStyle = { padding: '20px' };

    return (
        <div style={containerStyle}>
            <ThreatRadar />
        </div>
    );
}