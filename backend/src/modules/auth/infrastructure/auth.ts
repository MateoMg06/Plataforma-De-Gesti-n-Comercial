// Carga el .env ANTES de leer process.env abajo. Este archivo se evalúa al
// importar los módulos, que es antes de que ConfigModule de NestJS cargue el
// .env. Es el mismo truco que usa src/database/data-source.ts.
import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { createAccessControl } from 'better-auth/plugins/access';
import { admin } from 'better-auth/plugins/admin';
import { defaultStatements } from 'better-auth/plugins/admin/access';
import { Pool } from 'pg';
import { databaseSslConfig } from '../../../config/database.config.js';

// HU-04 (Kevin V): permisos del plugin oficial "admin" sobre el recurso user.
// Se parte de los permisos por defecto del plugin para que sus endpoints
// (create-user, list-users, ban-user...) funcionen.
const ac = createAccessControl(defaultStatements);
const administrador = ac.newRole({
  user: ['create', 'list', 'update', 'set-role', 'ban', 'get'],
});
const lider = ac.newRole({ user: ['list'] });
const asesor = ac.newRole({ user: [] });

// Instancia de BetterAuth (HU-01). Es el adaptador que crea y controla
// usuarios, sesiones y contraseñas. Usa el MISMO PostgreSQL que TypeORM,
// conectando con el pool de pg que ya trae el proyecto.
// BetterAuth crea sus tablas (user, session, account, verification) con
// su propio esquema; ver migration CrearTablasBetterAuth.
export const auth = betterAuth({
  database: new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'comercial',
    password: process.env.DB_PASSWORD ?? 'comercial',
    database: process.env.DB_NAME ?? 'comercial360',
    ssl: databaseSslConfig(),
  }),
  // HU-01: solo correo y contraseña. El login con Microsoft es opcional y va al final.
  emailAndPassword: { enabled: true },
  // HU-03: rol del usuario (administrador, lider o asesor). Es un campo extra
  // oficial de BetterAuth: viaja en la sesión como user.role y lo lee el
  // decorador @Roles(). input: false impide que alguien elija su rol al registrarse.
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'asesor', input: false },
    },
  },
  // HU-04: administración de usuarios con el plugin oficial "admin".
  // Solo el administrador usa /api/auth/admin/* (los demás reciben 403).
  // Desactivar un usuario = "ban": BetterAuth no lo deja iniciar sesión y
  // cierra sus sesiones abiertas. No se borran usuarios (tienen historial).
  plugins: [
    admin({
      ac,
      roles: { administrador, lider, asesor },
      adminRoles: ['administrador'],
      defaultRole: 'asesor',
    }),
  ],
  // Secreto de cifrado y URL base: salen del .env, nunca del código.
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  // El frontend (otro origen/puerto) puede enviar la cookie de sesión.
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:5173'],
});
