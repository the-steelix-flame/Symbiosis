import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './ThreatRadar.css';
import './ThreatDashboard.css';
import ThreatDashboard from './ThreatDashboard';

// --- ICONS (Complete with all prediction types) ---
const customIcons = {
    deforestation: new L.Icon({
        iconUrl: '/icons/leaf.png',
        iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [0, -35]
    }),
    plastic: new L.Icon({
        iconUrl: '/icons/plastic.png',
        iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [0, -35]
    }),
    coral: new L.Icon({
        iconUrl: '/icons/coral.png',
        iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [0, -35]
    }),
    // AI Predictions (using the same pulsating animation for all)
    predicted_deforestation: new L.Icon({
        iconUrl: '/icons/prediction.png',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
        className: 'prediction-icon'
    }),
    predicted_plastic: new L.Icon({
        iconUrl: '/icons/prediction.png',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
        className: 'prediction-icon'
    }),
    predicted_coral: new L.Icon({
        iconUrl: '/icons/prediction.png',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
        className: 'prediction-icon'
    })
};
const getIcon = (threatType) => customIcons[threatType] || new L.Icon.Default();

const themes = {
    dark: {
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        attribution: '&copy; Stadia Maps'
    },
    light: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; CARTO'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
	    attribution: 'Tiles &copy; Esri'
    }
};

const Legend = () => (
    <div className="legend">
        <h4>Legend</h4>
        <div><img src="/icons/leaf.png" alt="report" /><span>Validated Report</span></div>
        <div><img src="/icons/prediction.png" alt="prediction" /><span>AI Prediction</span></div>
    </div>
);

const MapEvents = ({ onViewportChange, onMapClick }) => {
    const map = useMapEvents({
        moveend: () => onViewportChange(map.getCenter()),
        zoomend: () => onViewportChange(map.getCenter()),
        click: (e) => onMapClick(e.latlng),
    });
    return null;
};

export default function ThreatRadar() {
    const [threats, setThreats] = useState([]);
    const [predictions, setPredictions] = useState([]); // A single array for all prediction types
    const [loading, setLoading] = useState(true);
    const [selectedThreat, setSelectedThreat] = useState(null);
    const [regionalWeather, setRegionalWeather] = useState(null);
    
    // IMPORTANT: Replace this with your actual key.
    const OPENWEATHER_API_KEY = "your_openweathermap_api_key";

    const weatherLayer = useMemo(() => (
        <TileLayer
            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
            attribution='&copy; OpenWeatherMap'
        />
    ), [OPENWEATHER_API_KEY]);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch all data sources in parallel for maximum speed
                const responses = await Promise.all([
                    fetch('http://localhost:8000/api/threats'),
                    fetch('http://localhost:8000/api/predictions/deforestation'),
                    fetch('http://localhost:8000/api/predictions/plastic'),
                    fetch('http://localhost:8000/api/predictions/coral')
                ]);

                // Process the real threat data
                if (responses[0].ok) {
                    const threatsData = await responses[0].json();
                    setThreats(threatsData);
                }

                // Process all prediction data, filtering out any that failed
                const predictionResults = await Promise.all(
                    responses.slice(1).map(res => res.ok ? res.json() : null)
                );
                setPredictions(predictionResults.filter(p => p !== null));

            } catch (error) {
                console.error("Failed to fetch map data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const handleViewportChange = async (center) => {
        try {
            const response = await fetch(`http://localhost:8000/api/weather?lat=${center.lat}&lon=${center.lng}`);
            const weatherData = await response.json();
            if (weatherData.cod === 200) {
                setRegionalWeather(weatherData);
            }
        } catch (error) {
            console.error("Failed to fetch regional weather:", error);
        }
    };

    const handleMapClick = (latlng) => {
        setSelectedThreat({ lat: latlng.lat, lng: latlng.lng });
        handleViewportChange(latlng);
    };

    const handleMarkerClick = (threat) => {
        setSelectedThreat(threat);
    };
    
    const closeDashboard = () => {
        setSelectedThreat(null);
        setRegionalWeather(null);
    };
    
    const isDashboardVisible = selectedThreat || regionalWeather;

    if (loading) return <p>Loading Threat Radar...</p>;

    return (
        <div>
            <h2>Environmental Threat Radar</h2>
            <div className="map-container">
                <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Dark Mode">
                            <TileLayer url={themes.dark.url} attribution={themes.dark.attribution} />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Light Mode">
                            <TileLayer url={themes.light.url} attribution={themes.light.attribution} />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite">
                             <TileLayer url={themes.satellite.url} attribution={themes.satellite.attribution} />
                        </LayersControl.BaseLayer>
                        <LayersControl.Overlay name="Weather Radar">
                            {weatherLayer}
                        </LayersControl.Overlay>
                    </LayersControl>
                    
                    <MapEvents onViewportChange={handleViewportChange} onMapClick={handleMapClick} />
                    
                    {/* Render markers for validated reports */}
                    {threats.map(threat => (
                        <Marker
                            key={threat.id}
                            position={[threat.lat, threat.lng]}
                            icon={getIcon(threat.type)}
                            eventHandlers={{ click: () => handleMarkerClick(threat) }}
                        ><Popup>{threat.title}</Popup></Marker>
                    ))}

                    {/* Render markers for ALL AI predictions */}
                    {predictions.map((pred, index) => (
                        <Marker
                            key={`pred-${index}`}
                            position={[pred.lat, pred.lng]}
                            icon={getIcon(pred.type)}
                            eventHandlers={{ click: () => handleMarkerClick(pred) }}
                        ><Popup>{pred.title}</Popup></Marker>
                    ))}
                </MapContainer>
                
                <Legend />

                {isDashboardVisible && (
                    <ThreatDashboard 
                        threat={selectedThreat} 
                        closeDashboard={closeDashboard}
                        regionalWeather={regionalWeather}
                    />
                )}
            </div>
        </div>
    );
}