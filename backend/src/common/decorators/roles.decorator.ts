import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../enums/domain.enums.js';

// HU-03: marca una ruta como reservada a ciertos roles.
//   @Roles(UserRole.ADMINISTRADOR, UserRole.LIDER)
// Se puede poner sobre el método o sobre el controlador completo.
//
// OJO: la clave 'roles' es distinta de la que usa la librería de BetterAuth
// ('ROLES'). A propósito: la de la librería solo entiende el plugin admin
// y dejaría pasar a cualquiera que no tenga ese campo.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
