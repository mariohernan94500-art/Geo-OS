const express = require('express');
const app = express();
const port = 3004;

app.use(express.json());

const weatherData = [
  { id: 1, city: 'Buenos Aires', temperature: 22, condition: 'Sunny' },
  { id: 2, city: 'New York', temperature: 18, condition: 'Cloudy' },
  { id: 3, city: 'London', temperature: 12, condition: 'Rainy' },
];

app.get('/api/weather', (req, res) => {
  res.json(weatherData);
});

app.get('/api/weather/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const weather = weatherData.find((w) => w.id === id);
  if (!weather) {
    res.status(404).json({ message: 'Weather not found' });
  } else {
    res.json(weather);
  }
});

app.post('/api/weather', (req, res) => {
  const { city, temperature, condition } = req.body;
  if (!city || !temperature || !condition) {
    res.status(400).json({ message: 'Faltan datos' });
  } else {
    const newWeather = {
      id: weatherData.length + 1,
      city,
      temperature,
      condition,
    };
    weatherData.push(newWeather);
    res.json(newWeather);
  }
});

app.put('/api/weather/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const weather = weatherData.find((w) => w.id === id);
  if (!weather) {
    res.status(404).json({ message: 'Weather not found' });
  } else {
    const { city, temperature, condition } = req.body;
    if (!city || !temperature || !condition) {
      res.status(400).json({ message: 'Faltan datos' });
    } else {
      weather.city = city;
      weather.temperature = temperature;
      weather.condition = condition;
      res.json(weather);
    }
  }
});

app.delete('/api/weather/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = weatherData.findIndex((w) => w.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Weather not found' });
  } else {
    weatherData.splice(index, 1);
    res.json({ message: 'Weather deleted' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});