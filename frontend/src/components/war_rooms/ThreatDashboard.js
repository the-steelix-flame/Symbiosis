import React from 'react';
import './ThreatDashboard.css';


// Helper component to format and display weather data
const formatWeatherData = (weather) => {
    if (!weather) {
        return <p>No regional weather data available.</p>;
    }
    return (
        <div className="weather-info">
            <h4>Regional Weather</h4>
            <p><strong>{weather.weather[0].main}</strong>: {weather.weather[0].description}</p>
            <p><strong>Temperature:</strong> {(weather.main.temp).toFixed(1)}&deg;C</p>
            <p><strong>Wind Speed:</strong> {weather.wind.speed} m/s</p>
        </div>
    );
};

export default function ThreatDashboard({ threat, closeDashboard, regionalWeather }) {
    // Don't render anything if there's no selected threat or weather data
    if (!threat && !regionalWeather) {
        return null;
    }

    return (
        <div className="threat-dashboard">
            <button onClick={closeDashboard} className="close-btn">&times;</button>

            {/* Display Threat Details */}
            {threat && (
                <div className="threat-details">
                    <h3>Threat Details</h3>

                    {/* --- THIS IS THE NEW PART --- */}
                    {/* If the threat is a user upload and has an image, display it */}
                    {threat.type === 'eco_upload' && threat.imageUrl && (
                        <div className="threat-image-container">
                            <img src={threat.imageUrl} alt={threat.title || 'User uploaded content'} className="threat-image" />
                        </div>
                    )}
                    {/* --- END OF NEW PART --- */}

                    <p><strong>Title:</strong> {threat.title || 'Selected Location'}</p>
                    <p><strong>Type:</strong> {threat.type || 'N/A'}</p>
                    <p><strong>Location:</strong> {threat.lat.toFixed(4)}, {threat.lng.toFixed(4)}</p>
                </div>
            )}

            {/* Display Regional Weather */}
            {regionalWeather && formatWeatherData(regionalWeather)}
        </div>
    );
}