// Import necessary modules
const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const weatherRoutes = require('./api/routes/weather');

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Middlewares
app.use(logger('dev')); // Logging middleware
app.use(express.json()); // Parses JSON request bodies

// Routes
app.use('/weather', weatherRoutes);

/**
 * GET Home Route
 * Sends a welcome message for the root URL
 */
app.get('/', (req, res) => {
  res.status(200).send('Welcome to my Langchain Project!');
});

/**
 * POST Weather Route
 * Handles weather-related queries and returns data based on user input
 */
app.post('/weather', weatherRoutes);

// Export the app for use in other files
module.exports = app;
