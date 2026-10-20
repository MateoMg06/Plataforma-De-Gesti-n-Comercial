import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './infrastructure/auth.js';

// Módulo de autenticación (HU-01 a HU-04). Responsable: Kevin V.
// Monta el handler de BetterAuth bajo /api/auth/*: login, logout y sesión.
//
// El AuthGuard global queda DESACTIVADO en HU-01 para no romper los otros
// módulos (/api/health, /api/zonas...). Activarlo con @AllowAnonymous() y
// @Roles() es la HU-02 y HU-03.
@Module({
  imports: [BetterAuthModule.forRoot({ auth, disableGlobalAuthGuard: true })],
})
export class AuthModule {}
