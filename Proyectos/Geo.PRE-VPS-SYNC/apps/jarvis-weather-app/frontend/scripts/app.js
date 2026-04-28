const apiEndpoint = 'http://localhost:3004/weather';
const weatherContainer = document.getElementById('weather-container');
const locationInput = document.getElementById('location-input');
const searchButton = document.getElementById('search-button');
const weatherData = {};

searchButton.addEventListener('click', fetchWeatherData);

function fetchWeatherData() {
  const location = locationInput.value.trim(); // Agregado trim() para eliminar espacios en blanco
  if (location !== '') { // Agregado validación para evitar llamadas vacías
    fetch(`${apiEndpoint}?location=${location}`)
      .then(response => {
        if (!response.ok) { // Agregado validación para manejar respuestas no OK
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => updateWeatherData(data))
      .catch(error => console.error('Error fetching weather data:', error));
  } else {
    console.error('Por favor, ingrese una ubicación');
  }
}

function updateWeatherData(data) {
  weatherData = data;
  updateUI();
}

function updateUI() {
  if (weatherData.temperature && weatherData.condition && weatherData.location) { // Agregado validación para evitar errores de acceso a propiedades
    const temperature = weatherData.temperature;
    const condition = weatherData.condition;
    const location = weatherData.location;

    const temperatureElement = document.getElementById('temperature');
    const conditionElement = document.getElementById('condition');
    const locationElement = document.getElementById('location');

    temperatureElement.textContent = `${temperature}°C`;
    conditionElement.textContent = condition;
    locationElement.textContent = location;

    weatherContainer.style.display = 'block';
  } else {
    console.error('Datos de clima incompletos');
  }
}