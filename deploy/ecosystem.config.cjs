// HU-INF-03: configuración de pm2 para el backend en EC2.
// pm2 mantiene el proceso vivo, lo reinicia si se cae y, con `pm2 startup` +
// `pm2 save`, lo vuelve a levantar cuando el servidor se reinicia.
// Las variables salen de backend/.env del servidor (nunca del repositorio).
module.exports = {
  apps: [
    {
      name: 'comercial360-api',
      cwd: __dirname + '/../backend',
      script: 'dist/main.js',
      env: { NODE_ENV: 'production' },
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};
