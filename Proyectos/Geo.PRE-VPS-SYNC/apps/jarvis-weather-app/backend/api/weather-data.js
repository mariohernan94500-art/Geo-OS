const express = require('express');
const axios = require('axios');

const app = express();
const port = 3003;

app.use(express.json());

const apiWeather = 'https://api-simulada-weather.com/weather';

app.get('/weather', async (req, res) => {
  try {
    const response = await axios.get(apiWeather);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener datos del clima' });
  }
});

app.get('/weather/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const response = await axios.get(`${apiWeather}?city=${encodeURIComponent(city)}`);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener datos del clima' });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});