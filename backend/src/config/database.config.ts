import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { DataSourceOptions } from 'typeorm';

// RDS: cifrar la conexión y comprobar el certificado del servidor.
// Local mantiene DB_SSL=false y no necesita certificado.
export function databaseSslConfig(): false | { rejectUnauthorized: true; ca: string } {
  if (process.env.DB_SSL !== 'true') return false;
  const rutaCertificado = process.env.DB_SSL_CA;
  if (!rutaCertificado) {
    throw new Error(
      'DB_SSL=true requiere DB_SSL_CA con la ruta del certificado CA de RDS',
    );
  }
  return {
    rejectUnauthorized: true,
    ca: readFileSync(rutaCertificado, 'utf8'),
  };
}

// Una sola fuente de configuración para la app y para el CLI de migraciones.
// Los valores salen de variables de entorno: nunca se escriben en el código.
export function databaseConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'comercial',
    password: process.env.DB_PASSWORD ?? 'comercial',
    database: process.env.DB_NAME ?? 'comercial360',
    ssl: databaseSslConfig(),
    // Rutas a archivos .js: la app y las migraciones siempre corren desde dist/ ya compilado.
    // fileURLToPath (y no .pathname) para que la ruta también funcione en Windows.
    entities: [
      fileURLToPath(
        new URL(
          '../modules/**/infrastructure/*.orm-entity.js',
          import.meta.url,
        ),
      ),
    ],
    migrations: [
      fileURLToPath(new URL('../database/migrations/*.js', import.meta.url)),
    ],
    // Nunca true: el esquema solo cambia con migraciones versionadas (HU-INF-02).
    synchronize: false,
  };
}
