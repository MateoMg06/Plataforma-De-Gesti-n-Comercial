import dataSource from '../../../database/data-source.js';

// Ejecutar después de las migraciones. No duplica opciones ni modifica las existentes.
await dataSource.initialize();
try {
  await dataSource.transaction(async (manager) => {
    await manager.query(
      `INSERT INTO zona (nombre) VALUES ('Centro'), ('Norte') ON CONFLICT (nombre) DO NOTHING`,
    );
    await manager.query(
      `INSERT INTO tipo_cliente (nombre) VALUES ('Minorista'), ('Mayorista') ON CONFLICT (nombre) DO NOTHING`,
    );
    await manager.query(
      `INSERT INTO potencial (nombre, orden) VALUES ('Alto', 1), ('Medio', 2), ('Bajo', 3) ON CONFLICT (nombre) DO NOTHING`,
    );
    await manager.query(
      `INSERT INTO estado_cliente (nombre) VALUES ('Prospecto'), ('Cliente') ON CONFLICT (nombre) DO NOTHING`,
    );
  });
  console.log('Catálogos iniciales disponibles.');
} finally {
  await dataSource.destroy();
}
