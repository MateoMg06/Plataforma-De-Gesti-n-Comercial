// Carga el .env ANTES de leer process.env abajo. Este archivo se evalúa al
// importar los módulos, que es antes de que ConfigModule de NestJS cargue el
// .env. Es el mismo truco que usa src/database/data-source.ts.
import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

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
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }),
  // HU-01: solo correo y contraseña. El login con Microsoft es opcional y va al final.
  emailAndPassword: { enabled: true },
  // HU-03: rol del usuario (administrador, lider o asesor). Es un campo extra
  // oficial de BetterAuth: viaja en la sesión como user.role y lo lee el
  // decorador @Roles(). input: false impide que alguien elija su rol al registrarse.
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'asesor', input: false },
      activo: {type: 'boolean',defaultValue: true, input: false },
    },
  },
  // Secreto de cifrado y URL base: salen del .env, nunca del código.
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  // El frontend (otro origen/puerto) puede enviar la cookie de sesión.
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:5173'],
});
