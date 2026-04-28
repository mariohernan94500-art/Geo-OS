const config = {
  port: 3003,
  api: {
    url: 'https://api-clima-simulada.herokuapp.com',
    key: 'jarvis-weather-app-key'
  },
  database: {
    host: 'localhost',
    user: 'jarvis',
    password: 'jarvis-password',
    database: 'jarvis-weather-app'
  }
};

module.exports = config;