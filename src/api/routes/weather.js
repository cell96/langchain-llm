const express = require('express');
const router = express.Router();
const {
  processWeatherQuery,
  handleWeatherDataOperation,
} = require('../services/langchain.service');

router.post('/', async (req, res) => {
  const { query } = req.body;

  try {
    const result = await processWeatherQuery(query);

    if (result.error) {
      res.status(500).json({ error: result.error });
    } else {
      res.json(result.data);
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

router.post('/manage-weather', async (req, res) => {
  const { command } = req.body;
  const result = await handleWeatherDataOperation(command);

  if (result.error) {
    res
      .status(400)
      .json({ error: 'Error managing weather data', details: result.error });
  } else {
    res.json({ message: 'Operation successful', data: result.data });
  }
});

module.exports = router;
