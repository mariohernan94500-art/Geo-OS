module.exports = {
  apps: [{
    name: 'geo',
    script: 'dist/index.js',
    cwd: '/var/www/geo/Proyectos/GEO',
    env_file: '/var/www/geo/Proyectos/GEO/.env',
  }]
}
