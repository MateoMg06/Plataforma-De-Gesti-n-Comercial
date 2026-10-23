#!/usr/bin/env bash
# HU-INF-03: despliega Comercial 360 en el EC2. Lo corre una persona o Jenkins (HU-INF-05).
# Uso: deploy/desplegar.sh [rama]     (por defecto main, que es lo desplegado)
# Requisitos en el servidor: ver docs/despliegue-aws.md.
set -euo pipefail

RAMA="${1:-main}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
WEB=/var/www/comercial360

echo "==> Actualizando el código ($RAMA)"
cd "$RAIZ"
git fetch origin
git checkout "$RAMA"
git pull --ff-only origin "$RAMA"

echo "==> Backend: dependencias, build, pruebas y migraciones"
cd "$RAIZ/backend"
npm ci
npm run build
npm test
# Las migraciones usan backend/.env del servidor (RDS con DB_SSL=true).
npm run typeorm -- migration:run

echo "==> Frontend: build con la API en la misma dirección (/api)"
cd "$RAIZ/frontend"
npm ci
VITE_API_URL=/api npm run build
sudo mkdir -p "$WEB"
sudo rsync -a --delete dist/ "$WEB/"

echo "==> Reiniciando el backend con pm2"
pm2 startOrReload "$RAIZ/deploy/ecosystem.config.cjs"
pm2 save

echo "==> Comprobando que la API responde"
for intento in $(seq 1 20); do
  if curl -fs http://127.0.0.1:3000/api/health > /dev/null; then
    echo "Listo: Comercial 360 desplegado desde $RAMA"
    exit 0
  fi
  sleep 2
done
echo "ERROR: la API no respondió. Revisa: pm2 logs comercial360-api" >&2
exit 1
