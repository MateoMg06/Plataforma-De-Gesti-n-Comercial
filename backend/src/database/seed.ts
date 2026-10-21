// Datos de prueba para la demo (HU-INF-02). Uso: npm run seed
//
// - Se puede correr varias veces: lo que ya existe no se vuelve a crear.
// - Las fechas de las visitas son relativas a HOY, así la agenda siempre tiene datos.
// - Los usuarios se crean con la API de BetterAuth (contraseñas cifradas) y luego
//   se les asigna el rol, que nadie puede elegir al registrarse (HU-03).
// Solo para desarrollo y demo: nunca correr contra la base de producción.
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config.js';
import { auth } from '../modules/auth/infrastructure/auth.js';

// Contraseña de prueba de todos los usuarios del seed (documentada en el README).
const CLAVE = 'Demo2026!';

const usuarios = [
  { nombre: 'Administrador', email: 'admin@comercial360.co', rol: 'administrador' },
  { nombre: 'Diana Rojas', email: 'lider@comercial360.co', rol: 'lider' },
  { nombre: 'Laura Gómez', email: 'laura@comercial360.co', rol: 'asesor' },
  { nombre: 'Carlos Pérez', email: 'carlos@comercial360.co', rol: 'asesor' },
  { nombre: 'Sofía Martínez', email: 'sofia@comercial360.co', rol: 'asesor' },
  { nombre: 'Juan Torres', email: 'juan@comercial360.co', rol: 'asesor' },
];

// Juan Torres no tiene asesor vinculado: sirve para mostrar el mensaje de "Mi agenda" sin asesor.
const asesores = [
  { nombre: 'Laura Gómez', correo: 'laura@comercial360.co', telefono: '3001112233', estado: 'activo' },
  { nombre: 'Carlos Pérez', correo: 'carlos@comercial360.co', telefono: '3004445566', estado: 'activo' },
  { nombre: 'Sofía Martínez', correo: 'sofia@comercial360.co', telefono: '3007778899', estado: 'activo' },
  { nombre: 'Pedro Ruiz', correo: 'pedro@comercial360.co', telefono: '3010001122', estado: 'inactivo' },
];

const zonas = ['Norte', 'Sur', 'Centro', 'Oriente'];
const tipos = ['Industrial', 'Distribuidor', 'Retail'];
const potenciales = [
  { nombre: 'Alto', orden: 1 },
  { nombre: 'Medio', orden: 2 },
  { nombre: 'Bajo', orden: 3 },
];
const estadosCliente = ['Activo', 'Prospecto', 'En negociación'];

// 10 clientes del Valle de Aburrá y Oriente con coordenadas reales (para el mapa).
const clientes = [
  { nit: '900100001-1', razon: 'Distribuidora Andina SAS', comercial: 'Andina', dir: 'Calle 10 # 43-20', mun: 'Medellín', barrio: 'El Poblado', zona: 'Sur', tipo: 'Distribuidor', pot: 'Alto', lat: 6.2088, lng: -75.5671 },
  { nit: '900100002-2', razon: 'Ferretería El Tornillo', comercial: 'El Tornillo', dir: 'Carrera 43A # 38 Sur-15', mun: 'Envigado', barrio: 'Zúñiga', zona: 'Sur', tipo: 'Retail', pot: 'Medio', lat: 6.1719, lng: -75.5911 },
  { nit: '900100003-3', razon: 'Metalúrgicas del Valle SAS', comercial: 'Metavalle', dir: 'Calle 50 # 41-30', mun: 'Itagüí', barrio: 'Centro', zona: 'Sur', tipo: 'Industrial', pot: 'Alto', lat: 6.1846, lng: -75.5991 },
  { nit: '900100004-4', razon: 'Construinnova SAS', comercial: 'Construinnova', dir: 'Diagonal 55 # 37-41', mun: 'Bello', barrio: 'Niquía', zona: 'Norte', tipo: 'Industrial', pot: 'Alto', lat: 6.3373, lng: -75.5579 },
  { nit: '900100005-5', razon: 'Soluciones Industriales Ltda', comercial: 'Solind', dir: 'Carrera 45 # 70 Sur-10', mun: 'Sabaneta', barrio: 'Aves María', zona: 'Sur', tipo: 'Industrial', pot: 'Medio', lat: 6.1515, lng: -75.6166 },
  { nit: '900100006-6', razon: 'Aceros de Antioquia SA', comercial: 'Aceros Antioquia', dir: 'Carrera 52 # 10-25', mun: 'Medellín', barrio: 'Guayabal', zona: 'Centro', tipo: 'Industrial', pot: 'Alto', lat: 6.214, lng: -75.585 },
  { nit: '900100007-7', razon: 'Distribuciones JM', comercial: 'JM', dir: 'Circular 4 # 70-12', mun: 'Medellín', barrio: 'Laureles', zona: 'Centro', tipo: 'Distribuidor', pot: 'Medio', lat: 6.2447, lng: -75.5946 },
  { nit: '900100008-8', razon: 'Ferretería La 14', comercial: 'La 14', dir: 'Carrera 52 # 49-14', mun: 'Medellín', barrio: 'La Candelaria', zona: 'Centro', tipo: 'Retail', pot: 'Bajo', lat: 6.2476, lng: -75.5658 },
  { nit: '900100009-9', razon: 'Comercializadora Oriente SAS', comercial: 'Oriente', dir: 'Calle 49 # 50-30', mun: 'Rionegro', barrio: 'Centro', zona: 'Oriente', tipo: 'Distribuidor', pot: 'Medio', lat: 6.1551, lng: -75.3737 },
  { nit: '900100010-0', razon: 'Suministros del Norte', comercial: 'SumiNorte', dir: 'Carrera 50 # 49-80', mun: 'Copacabana', barrio: 'Centro', zona: 'Norte', tipo: 'Retail', pot: 'Bajo', lat: 6.3486, lng: -75.5089 },
];

const db = new DataSource(databaseConfig());

// Primera fila de una consulta (o undefined).
async function uno<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const filas = (await db.query(sql, params)) as T[];
  return filas[0];
}

// Fecha relativa a hoy, a una hora local: enDias(1, 9, 30) = mañana a las 9:30.
function enDias(dias: number, hora = 0, minuto = 0): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(hora, minuto, 0, 0);
  return fecha;
}

// Solo la fecha (YYYY-MM-DD) para columnas de tipo date.
const soloFecha = (fecha: Date) => fecha.toLocaleDateString('en-CA');

async function idPorNombre(tabla: string, columnaId: string, nombre: string): Promise<number> {
  const fila = await uno<{ id: number }>(`SELECT ${columnaId} AS id FROM ${tabla} WHERE nombre = $1`, [nombre]);
  if (!fila) throw new Error(`No existe ${nombre} en ${tabla}`);
  return fila.id;
}

async function crearUsuarios() {
  for (const u of usuarios) {
    const existe = await uno(`SELECT id FROM "user" WHERE email = $1`, [u.email]);
    if (!existe) {
      await auth.api.signUpEmail({ body: { name: u.nombre, email: u.email, password: CLAVE } });
    }
    // El rol se asigna aquí porque nadie puede elegirlo al registrarse (HU-03).
    await db.query(`UPDATE "user" SET role = $1 WHERE email = $2`, [u.rol, u.email]);
  }
}

async function crearCatalogos() {
  for (const nombre of zonas) {
    await db.query(`INSERT INTO zona (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING`, [nombre]);
  }
  for (const nombre of tipos) {
    await db.query(`INSERT INTO tipo_cliente (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING`, [nombre]);
  }
  for (const p of potenciales) {
    await db.query(`INSERT INTO potencial (nombre, orden) VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING`, [p.nombre, p.orden]);
  }
  for (const nombre of estadosCliente) {
    await db.query(`INSERT INTO estado_cliente (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING`, [nombre]);
  }
}

async function crearAsesores() {
  for (const a of asesores) {
    await db.query(
      `INSERT INTO asesor (nombre, correo, telefono, estado) VALUES ($1, $2, $3, $4) ON CONFLICT (correo) DO NOTHING`,
      [a.nombre, a.correo, a.telefono, a.estado],
    );
    // Une el asesor con su usuario de login (HU-12: "Mi agenda").
    await db.query(
      `UPDATE asesor SET id_usuario = u.id FROM "user" u WHERE u.email = asesor.correo AND asesor.correo = $1`,
      [a.correo],
    );
  }
}

async function crearClientes() {
  const idEstado = await idPorNombre('estado_cliente', 'id_estado_cliente', 'Activo');
  for (const c of clientes) {
    await db.query(
      `INSERT INTO cliente (nit, razon_social, nombre_comercial, direccion, departamento, municipio, barrio,
         telefono, email, id_zona, id_tipo_cliente, id_potencial, id_estado_cliente, frecuencia_visita_dias, latitud, longitud)
       VALUES ($1, $2, $3, $4, 'Antioquia', $5, $6, $7, $8, $9, $10, $11, $12, 15, $13, $14)
       ON CONFLICT (nit) DO NOTHING`,
      [
        c.nit, c.razon, c.comercial, c.dir, c.mun, c.barrio,
        `604${c.nit.slice(5, 12).replace('-', '')}`,
        // Dominio propio del seed: así no choca con clientes que alguien ya cargó a mano
        // (el correo del cliente también es único).
        `compras.${c.comercial.toLowerCase().replace(/[^a-z]/g, '')}@demo.comercial360.co`,
        await idPorNombre('zona', 'id_zona', c.zona),
        await idPorNombre('tipo_cliente', 'id_tipo_cliente', c.tipo),
        await idPorNombre('potencial', 'id_potencial', c.pot),
        idEstado, c.lat, c.lng,
      ],
    );
    // Un contacto principal por cliente (HU-07), solo si aún no tiene contactos.
    const cliente = await uno<{ id: number }>(`SELECT id_cliente AS id FROM cliente WHERE nit = $1`, [c.nit]);
    const tieneContactos = await uno(`SELECT 1 FROM contacto_cliente WHERE id_cliente = $1`, [cliente!.id]);
    if (!tieneContactos) {
      await db.query(
        `INSERT INTO contacto_cliente (id_cliente, nombre, cargo, telefono, celular, email, es_principal)
         VALUES ($1, $2, 'Jefe de Compras', '6044440000', '3100000000', $3, true)`,
        [cliente!.id, `Contacto ${c.comercial}`, `jefe.${c.comercial.toLowerCase().replace(/[^a-z]/g, '')}@demo.comercial360.co`],
      );
    }
  }
}

const idCliente = async (nit: string) => (await uno<{ id: number }>(`SELECT id_cliente AS id FROM cliente WHERE nit = $1`, [nit]))!.id;
const idAsesor = async (correo: string) => (await uno<{ id: number }>(`SELECT id_asesor AS id FROM asesor WHERE correo = $1`, [correo]))!.id;

async function crearRutasYVisitas() {
  // Si ya existe la ruta de Laura, las rutas y visitas del seed ya se crearon.
  if (await uno(`SELECT 1 FROM ruta WHERE nombre = 'RUT-NORTE-001'`)) return;
  const laura = await idAsesor('laura@comercial360.co');
  const carlos = await idAsesor('carlos@comercial360.co');

  // Ruta activa de Laura (HU-16) con 4 clientes en orden.
  const rutaNorte = await uno<{ id: number }>(
    `INSERT INTO ruta (nombre, id_asesor, fecha_inicio, fecha_fin, estado) VALUES ('RUT-NORTE-001', $1, $2, $3, 'activa') RETURNING id_ruta AS id`,
    [laura, soloFecha(enDias(0)), soloFecha(enDias(4))],
  );
  const paradas = ['900100004-4', '900100010-0', '900100008-8', '900100007-7'];
  for (const [i, nit] of paradas.entries()) {
    await db.query(`INSERT INTO ruta_cliente (id_ruta, id_cliente, orden_visita) VALUES ($1, $2, $3)`, [rutaNorte!.id, await idCliente(nit), i + 1]);
  }
  // Ruta planeada de Carlos.
  const rutaSur = await uno<{ id: number }>(
    `INSERT INTO ruta (nombre, id_asesor, fecha_inicio, fecha_fin, estado) VALUES ('RUT-SUR-001', $1, $2, $3, 'planeada') RETURNING id_ruta AS id`,
    [carlos, soloFecha(enDias(3)), soloFecha(enDias(7))],
  );
  for (const [i, nit] of ['900100002-2', '900100003-3', '900100005-5', '900100006-6'].entries()) {
    await db.query(`INSERT INTO ruta_cliente (id_ruta, id_cliente, orden_visita) VALUES ($1, $2, $3)`, [rutaSur!.id, await idCliente(nit), i + 1]);
  }

  // Visitas con fechas relativas a hoy. fechaReal solo en las que ya pasaron.
  const visitas = [
    { nit: '900100004-4', asesor: laura, ruta: rutaNorte!.id, fecha: enDias(0, 8), estado: 'realizada', real: enDias(0, 8, 20), resultado: 'Visita comercial', obs: 'Interesado en la nueva línea; pide cotización.' },
    { nit: '900100010-0', asesor: laura, ruta: rutaNorte!.id, fecha: enDias(0, 10), estado: 'programada' },
    { nit: '900100008-8', asesor: laura, ruta: rutaNorte!.id, fecha: enDias(0, 15), estado: 'programada' },
    { nit: '900100007-7', asesor: laura, ruta: rutaNorte!.id, fecha: enDias(1, 9), estado: 'programada' },
    { nit: '900100002-2', asesor: carlos, ruta: null, fecha: enDias(-1, 9), estado: 'realizada', real: enDias(-1, 9, 15), resultado: 'Cobro', obs: 'Pagó la factura pendiente.' },
    { nit: '900100006-6', asesor: carlos, ruta: null, fecha: enDias(-2, 10), estado: 'no_atendida', real: enDias(-2, 10) },
    { nit: '900100009-9', asesor: carlos, ruta: null, fecha: enDias(-1, 14), estado: 'cancelada', real: enDias(-1, 14) },
    { nit: '900100003-3', asesor: carlos, ruta: null, fecha: enDias(0, 11, 30), estado: 'programada' },
    { nit: '900100005-5', asesor: carlos, ruta: null, fecha: enDias(2, 14), estado: 'programada' },
    { nit: '900100001-1', asesor: carlos, ruta: null, fecha: enDias(3, 16, 30), estado: 'reprogramada' },
  ];
  for (const v of visitas) {
    const visita = await uno<{ id: number }>(
      `INSERT INTO visita (id_cliente, id_asesor, id_ruta, fecha_programada, estado_visita, fecha_real)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_visita AS id`,
      [await idCliente(v.nit), v.asesor, v.ruta, v.fecha, v.estado, v.real ?? null],
    );
    if (v.resultado) {
      // Resultado de la visita (HU-19) y un seguimiento (HU-23).
      await db.query(
        `INSERT INTO visita_resultado (id_visita, id_resultado, observacion) VALUES ($1, $2, $3)`,
        [visita!.id, await idPorNombre('resultado_visita', 'id_resultado', v.resultado), v.obs],
      );
      await db.query(
        `INSERT INTO seguimiento (id_visita, fecha_proxima, actividad, observacion) VALUES ($1, $2, $3, $4)`,
        [visita!.id, soloFecha(enDias(v.estado === 'realizada' && v.asesor === laura ? 3 : -1)), 'Llamar al cliente', v.obs],
      );
    }
  }
}

async function crearCotizacionesYPedido() {
  const cotizaciones = [
    { numero: 1001, nit: '900100004-4', asesor: 'laura@comercial360.co', estado: 'aprobada', detalles: [['Equipo de soldadura', 2, 4500000], ['Kit de protección', 10, 85000]] },
    { numero: 1002, nit: '900100002-2', asesor: 'carlos@comercial360.co', estado: 'enviada', detalles: [['Tornillería industrial (caja)', 20, 45000]] },
    { numero: 1003, nit: '900100001-1', asesor: 'carlos@comercial360.co', estado: 'borrador', detalles: [['Taladro percutor', 3, 380000], ['Brocas (juego)', 5, 65000]] },
  ] as const;
  for (const c of cotizaciones) {
    if (await uno(`SELECT 1 FROM cotizacion WHERE numero = $1`, [c.numero])) continue;
    const valor = c.detalles.reduce((suma, [, cantidad, precio]) => suma + cantidad * precio, 0);
    const cotizacion = await uno<{ id: number }>(
      `INSERT INTO cotizacion (numero, id_cliente, id_asesor, fecha, valor, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_cotizacion AS id`,
      [c.numero, await idCliente(c.nit), await idAsesor(c.asesor), enDias(-1, 12), valor, c.estado],
    );
    for (const [producto, cantidad, precio] of c.detalles) {
      await db.query(
        `INSERT INTO cotizacion_detalle (id_cotizacion, producto, cantidad, precio, subtotal) VALUES ($1, $2, $3, $4, $5)`,
        [cotizacion!.id, producto, cantidad, precio, cantidad * precio],
      );
    }
    // La cotización aprobada ya se convirtió en pedido (HU-30).
    if (c.estado === 'aprobada') {
      await db.query(
        `INSERT INTO pedido (numero, id_cotizacion, id_cliente, valor, estado, fecha) VALUES (1, $1, $2, $3, 'pendiente', $4) ON CONFLICT (numero) DO NOTHING`,
        [cotizacion!.id, await idCliente(c.nit), valor, enDias(0, 9)],
      );
    }
  }
}

async function main() {
  await db.initialize();
  await crearUsuarios();
  await crearCatalogos();
  await crearAsesores();
  await crearClientes();
  await crearRutasYVisitas();
  await crearCotizacionesYPedido();
  console.log('Seed listo. Usuarios de prueba (contraseña Demo2026!):');
  for (const u of usuarios) console.log(`  ${u.rol.padEnd(14)} ${u.email}`);
  await db.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error('Error en el seed:', error);
  process.exit(1);
});
