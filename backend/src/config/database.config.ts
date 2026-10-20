import type { DataSourceOptions } from 'typeorm';

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
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    // Rutas a archivos .js: la app y las migraciones siempre corren desde dist/ ya compilado.
    entities: [new URL('../modules/**/infrastructure/*.orm-entity.js', import.meta.url).pathname],
    migrations: [new URL('../database/migrations/*.js', import.meta.url).pathname],
    // Nunca true: el esquema solo cambia con migraciones versionadas (HU-INF-02).
    synchronize: false,
  };
}
