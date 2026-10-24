import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './infrastructure/auth.js';

// Módulo de autenticación (HU-01 a HU-04). Responsable: Kevin V.
// Monta el handler de BetterAuth bajo /api/auth/*: login, logout y sesión.
//
// HU-02: el AuthGuard global ya está ACTIVO. Todos los endpoints privados
// responden 401 sin sesión. Los que deben ser públicos (como /api/health)
// se marcan con @AllowAnonymous().
@Module({
  imports: [BetterAuthModule.forRoot({ auth })],
})
export class AuthModule {}
