const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route imports
const userRoutes = require('./api/routes/userRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Allows requests from your frontend
app.use(express.json()); // Parses incoming JSON requests

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the EcoSynth Node.js API!' });
});

// Use routes
app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes); // Add this later

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});