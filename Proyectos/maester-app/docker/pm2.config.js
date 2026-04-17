module.exports = {
  apps : [
    {
      name      : 'GeoCore-API',
      script    : 'packages/geotrouvetout/dist/index.js',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      instances : 1,
      exec_mode : 'fork'
    },
    {
      name      : 'Voren-Dashboard',
      script    : 'npx',
      args      : 'http-server packages/voren -p 8080 --cors',
      instances : 1,
      exec_mode : 'fork'
    }
  ]
};
