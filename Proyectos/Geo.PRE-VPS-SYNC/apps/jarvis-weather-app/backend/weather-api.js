const express = require('express');
const app = express();
const port = 3004;

app.use(express.json());

const weatherData = [
  { id: 1, city: 'Buenos Aires', temperature: 22, condition: 'Sunny' },
  { id: 2, city: 'New York', temperature: 18, condition: 'Cloudy' },
  { id: 3, city: 'London', temperature: 12, condition: 'Rainy' },
];

app.get('/weather', (req, res) => {
  res.json(weatherData);
});

app.get('/weather/:city', (req, res) => {
  const city = req.params.city;
  const weather = weatherData.find((data) => data.city.toLowerCase() === city.toLowerCase());
  if (weather) {
    res.json(weather);
  } else {
    res.status(404).json({ message: 'Ciudad no encontrada' });
  }
});

app.listen(port, () => {
  console.log(`API del clima escuchando en el puerto ${port}`);
});