import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ObtenerUsuarioActualUseCase } from './application/obtener-usuario-actual.use-case.js';
import { auth } from './infrastructure/auth.js';

// Módulo de autenticación (HU-01 a HU-04). Responsable: Kevin V.
// Monta el handler de BetterAuth bajo /api/auth/*: login, logout y sesión.
//
// HU-02: el AuthGuard global ya está ACTIVO. Todos los endpoints privados
// responden 401 sin sesión. Los que deben ser públicos (como /api/health)
// se marcan con @AllowAnonymous().
//
// HU-03: además corre el RolesGuard, que revisa el @Roles() de cada ruta.
@Module({
  imports: [BetterAuthModule.forRoot({ auth })],
  providers: [
    ObtenerUsuarioActualUseCase,
    // El RolesGuard se registra DESPUÉS del AuthGuard de BetterAuth (que viene
    // en el import de arriba), para que cuando el guard de roles busca la
    // sesión ya esté disponible en la petición.
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  // Se exporta para que los demás módulos puedan preguntar quién es el
  // usuario de la sesión sin tocar el repositorio de BetterAuth.
  exports: [ObtenerUsuarioActualUseCase],
})
export class AuthModule {}
