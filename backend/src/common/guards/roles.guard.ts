import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { ObtenerUsuarioActualUseCase } from '../../modules/auth/application/obtener-usuario-actual.use-case.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { UserRole } from '../enums/domain.enums.js';

// Guard de roles (HU-03). Es global: todos los endpoints pasan por él.
//
// Si la ruta NO tiene @Roles(), deja pasar: basta con tener sesión.
// Si la tiene, se mira el rol del usuario de la sesión:
//   - sin sesión      -> 401 Unauthorized
//   - rol no permitido -> 403 Forbidden
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usuarioActual: ObtenerUsuarioActualUseCase,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!roles || roles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    // El AuthGuard de BetterAuth deja la sesión en request.session. Si todavía
    // no está (porque este guard se ejecuta antes), la buscamos nosotros.
    const sesion =
      request.session ??
      (await this.authService.api.getSession({
        headers: fromNodeHeaders(request.headers),
      }));

    if (!sesion?.user) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }

    const usuario = this.usuarioActual.ejecutar(sesion.user);
    if (!usuario.puedeAccederA(roles)) {
      throw new ForbiddenException('No tienes permisos para esta operación');
    }
    return true;
  }
}
