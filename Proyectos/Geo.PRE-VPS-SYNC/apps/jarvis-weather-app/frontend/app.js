import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [weather, setWeather] = useState({});
  const [city, setCity] = useState('Bogotá');

  useEffect(() => {
    axios.get(`http://localhost:3003/weather?city=${city}`)
      .then(response => {
        setWeather(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [city]);

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  return (
    <div className="app">
      <h1>Jarvis Weather App</h1>
      <input type="text" value={city} onChange={handleCityChange} placeholder="Ingrese la ciudad" />
      <div className="weather-info">
        {weather.city && (
          <>
            <p>Ciudad: {weather.city}</p>
            <p>Temperatura: {weather.temperature}°C</p>
            <p>Descripción: {weather.description}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;