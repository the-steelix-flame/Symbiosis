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
        iconSize: [100, 50], iconAnchor: [17, 35], popupAnchor: [0, -35]
    }),
    coral: new L.Icon({
        iconUrl: '/icons/coral.png',
        iconSize: [50, 50], iconAnchor: [17, 35], popupAnchor: [0, -35]
    }),
    eco_upload: new L.Icon({
        iconUrl: '/icons/upload.png', // Make sure to add this icon
        iconSize: [20, 20], iconAnchor: [17, 35], popupAnchor: [0, -35]
    }),
    // AI Predictions (using the same pulsating animation for all)
    predicted_deforestation: new L.Icon({
        iconUrl: '/icons/prediction_deforestation.png',
        iconSize: [50, 50],
        iconAnchor: [50, 38],
        popupAnchor: [0, -38],
        className: 'prediction-icon'
    }),
    predicted_plastic: new L.Icon({
        iconUrl: '/icons/prediction.png',
        iconSize: [58, 58],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
        className: 'prediction-icon'
    }),
    predicted_coral: new L.Icon({
        iconUrl: '/icons/prediction.png',
        iconSize: [48, 48],
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
        <div><img src="/icons/upload.png" alt="upload" /><span>User Upload</span></div>
        <div className="legend-nasa">
            <h5>GHG (CO at 215 hPa)</h5>
            <div className="color-scale">
                <span style={{ background: '#000080' }}></span>
                <span style={{ background: '#0000FF' }}></span>
                <span style={{ background: '#00FFFF' }}></span>
                <span style={{ background: '#00FF00' }}></span>
                <span style={{ background: '#FFFF00' }}></span>
                <span style={{ background: '#FF0000' }}></span>
            </div>
            <p>Low → High Concentration</p>
        </div>
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
    const [ecoUploads, setEcoUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedThreat, setSelectedThreat] = useState(null);
    const [regionalWeather, setRegionalWeather] = useState(null);

    // IMPORTANT: Replace this with your actual key.
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
    const NASA_API_KEY = process.env.NASA_API_KEY;


    const weatherLayer = useMemo(() => (
        <TileLayer
            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
            attribution='&copy; OpenWeatherMap'
        />
    ), [OPENWEATHER_API_KEY]);

    const ghgLayer = useMemo(() => (
        <TileLayer
            url={`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MLS_CO_215hPa_Day/default/EPSG3857_1km/{z}/{y}/{x}.png?api_key=${NASA_API_KEY}`}
            opacity={10} // Adjust for better blending
            attribution='&copy; NASA Global Imagery Browse Services (GIBS)'
        />
    ), [NASA_API_KEY]);


    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch all data sources in parallel for maximum speed
                const responses = await Promise.all([
                    fetch('/api/threats'),
                    fetch('/api/predictions/deforestation'),
                    fetch('/api/predictions/plastic'),
                    fetch('/api/predictions/coral'),
                    fetch('/api/eco-uploads')
                ]);

                // Process the real threat data
                if (responses[0].ok) {
                    const threatsData = await responses[0].json();
                    setThreats(threatsData);
                }

                // Process all prediction data, filtering out any that failed
                const predictionResults = await Promise.all(
                    responses.slice(1, 4).map(res => res.ok ? res.json() : null)
                );
                setPredictions(predictionResults.filter(p => p !== null).flat());

                if (responses[4].ok) {
                    const ecoUploadsData = await responses[4].json();
                    setEcoUploads(ecoUploadsData);
                }


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

            <div className="map-container">
                <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <h2>Environmental Threat Radar</h2>
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
                        <LayersControl.Overlay name="GHG Emissions (NASA)">
                            {ghgLayer}
                        </LayersControl.Overlay>
                    </LayersControl>

                    <MapEvents onViewportChange={handleViewportChange} onMapClick={handleMapClick} />

                    {/* Render markers for validated reports */}
                    {threats.filter(threat => threat.lat && threat.lng).map(threat => (
                        <Marker
                            key={threat.id}
                            position={[threat.lat, threat.lng]}
                            icon={getIcon(threat.type)}
                            eventHandlers={{ click: () => handleMarkerClick(threat) }}
                        ><Popup>{threat.title}</Popup></Marker>
                    ))}

                    {/* Render markers for ALL AI predictions */}
                    {predictions.filter(pred => pred.lat && pred.lng).map((pred, index) => (
                        <Marker
                            key={`pred-${index}`}
                            position={[pred.lat, pred.lng]}
                            icon={getIcon(pred.type)}
                            eventHandlers={{ click: () => handleMarkerClick(pred) }}
                        ><Popup>{pred.title}</Popup></Marker>
                    ))}

                    {/* Render markers for Eco Uploads */}
                    {ecoUploads.filter(upload => upload.lat && upload.lng).map(upload => (
                        <Marker
                            key={upload.id}
                            position={[upload.lat, upload.lng]}
                            icon={getIcon('eco_upload')}
                            eventHandlers={{ click: () => handleMarkerClick(upload) }}
                        ><Popup>{upload.title}</Popup></Marker>
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