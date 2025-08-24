const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Route Imports ---
const userRoutes = require('./api/routes/userRoutes');
const threatRoutes = require('./api/routes/threatRoutes');
const predictionRoutes = require('./api/routes/predictionRoutes');
const weatherRoutes = require('./api/routes/weatherRoutes');
const ecoUploadsRoutes = require('./api/routes/ecoUploadsRoutes');
const nasaRoutes = require('./api/routes/nasaRoutes');
const analysisRoutes = require('./api/routes/analysisRoutes');
const ecoScoreRoutes = require('./api/routes/ecoScoreRoutes');

// --- Initialize Express App ---
const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Test Route ---
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the EcoSynth backend API!' });
});

// --- Use Application Routes ---
app.use('/api/users', userRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/eco-uploads', ecoUploadsRoutes);
app.use('/api/nasa', nasaRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/eco-scores', ecoScoreRoutes);

// --- Define Port and Start Server ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});