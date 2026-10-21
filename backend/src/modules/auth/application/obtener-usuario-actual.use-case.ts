import { Injectable } from '@nestjs/common';
import { Usuario } from '../domain/usuario.js';

// Datos que BetterAuth deja en la sesión del navegador.
// "rol" y "activo" llegan cuando el usuario ya tiene esos campos en la base
// (HU-03 y HU-04); si no están, el dominio aplica el valor por defecto.
export interface UsuarioSesion {
  id: string;
  name: string;
  email: string;
  rol?: string | null;
  activo?: boolean | null;
}

// Caso de uso: saber quién es el usuario que está trabajando ahora.
// El guard de roles lo usa para decidir si una ruta se puede abrir.
@Injectable()
export class ObtenerUsuarioActualUseCase {
  ejecutar(usuario: UsuarioSesion): Usuario {
    return Usuario.desdeSesion({
      id: usuario.id,
      nombre: usuario.name,
      correo: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
    });
  }
}
