import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

export function loadEnv(): void {
  const envFilePath = path.resolve(__dirname, '..', '..', '.env');

  if (!fs.existsSync(envFilePath)) {
    console.error(
      `.env no encontrado en ${envFilePath}. Copia .env.example a .env y completa los valores.`,
    );
    process.exit(1);
  }

  config({ path: envFilePath, quiet: true });
}

loadEnv();
