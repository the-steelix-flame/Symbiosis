import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TrackSdgPage.css';

// --- Color function for the heat map based on the Eco-Score ---
const getEcoScoreColor = (score) => {
    return score > 80 ? '#2a9d8f' : // Excellent (Green)
           score > 60 ? '#e9c46a' : // Good (Yellow)
           score > 40 ? '#f4a261' : // Moderate (Orange)
           score > 20 ? '#e76f51' : // Poor (Red)
                        '#d62828';  // Critical (Dark Red)
};

const Legend = () => (
    <div className="legend">
        <h4>Eco-Score Legend</h4>
        <div className="legend-item">
            <div className="legend-color-box" style={{ backgroundColor: '#2a9d8f' }}></div>
            <span>Excellent (81-100)</span>
        </div>
        <div className="legend-item">
            <div className="legend-color-box" style={{ backgroundColor: '#e9c46a' }}></div>
            <span>Good (61-80)</span>
        </div>
        <div className="legend-item">
            <div className="legend-color-box" style={{ backgroundColor: '#f4a261' }}></div>
            <span>Moderate (41-60)</span>
        </div>
        <div className="legend-item">
            <div className="legend-color-box" style={{ backgroundColor: '#e76f51' }}></div>
            <span>Poor (21-40)</span>
        </div>
        <div className="legend-item">
            <div className="legend-color-box" style={{ backgroundColor: '#d62828' }}></div>
            <span>Critical (0-20)</span>
        </div>
    </div>
);

export default function TrackSdgPage() {
    const [ecoScores, setEcoScores] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEcoScores = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:8000/api/eco-scores');
                const data = await response.json();
                setEcoScores(data);
            } catch (error) {
                console.error("Failed to fetch Eco-Scores:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEcoScores();
    }, []);

    const geoJsonStyle = (feature) => ({
        fillColor: getEcoScoreColor(feature.properties.ecoScore),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    });

    const onEachFeature = (feature, layer) => {
        const { ST_NM, ecoScore, positiveActions, negativeReports, totalSubmissions } = feature.properties;
        const popupContent = `
            <h3>${ST_NM}</h3>
            <b>Eco-Score: ${ecoScore}/100</b><br/>
            <hr>
            <p>Positive Actions: ${positiveActions}</p>
            <p>Negative Reports: ${negativeReports}</p>
            <p>Total Submissions: ${totalSubmissions}</p>
        `;
        layer.bindPopup(popupContent);
    };

    return (
        <div className="sdg-page-container">
            <aside className="info-panel">
                <h1>Track SDG Progress</h1>
                <p>
                    This map provides a real-time "Eco-Score" for each state, summarizing environmental health and activity based on real time data.
                    The score helps track progress towards Sustainable Development Goals (SDGs) 13, 14, and 15 by visualizing critical hotspots and areas of positive impact.
                </p>
                <Legend />
            </aside>
            <main className="map-container-sdg">
                {loading && <div className="loading-overlay">Loading Eco-Scores...</div>}
                <MapContainer center={[22.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {ecoScores && (
                        <GeoJSON
                            data={ecoScores}
                            style={geoJsonStyle}
                            onEachFeature={onEachFeature}
                        />
                    )}
                </MapContainer>
            </main>
        </div>
    );
}