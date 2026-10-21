import { UserRole } from '../../../common/enums/domain.enums.js';
import { Usuario } from './usuario.js';

describe('Usuario', () => {
  it('degrada a asesor un rol que no existe', () => {
    const usuario = Usuario.desdeSesion({
      id: 'u1',
      nombre: 'Ana Pérez',
      correo: 'ana@empresa.com',
      rol: 'superusuario',
    });
    expect(usuario.rol).toBe(UserRole.ASESOR);
  });

  it('degrada a asesor cuando la sesión no trae rol', () => {
    const usuario = Usuario.desdeSesion({
      id: 'u1',
      nombre: 'Ana Pérez',
      correo: 'ana@empresa.com',
    });
    expect(usuario.rol).toBe(UserRole.ASESOR);
  });

  it('respeta el rol guardado en la base', () => {
    const usuario = Usuario.desdeSesion({
      id: 'u1',
      nombre: 'Mateo',
      correo: 'mateo@empresa.com',
      rol: 'administrador',
    });
    expect(usuario.rol).toBe(UserRole.ADMINISTRADOR);
  });

  it('deja entrar a un administrador en una ruta de administradores', () => {
    const usuario = new Usuario('u1', 'Mateo', 'mateo@empresa.com', UserRole.ADMINISTRADOR, true);
    expect(usuario.puedeAccederA([UserRole.ADMINISTRADOR])).toBe(true);
  });

  it('rechaza a un asesor en una ruta de administradores', () => {
    const usuario = new Usuario('u2', 'Luis', 'luis@empresa.com', UserRole.ASESOR, true);
    expect(usuario.puedeAccederA([UserRole.ADMINISTRADOR])).toBe(false);
  });

  it('deja entrar a un asesor en una ruta de administradores y asesores', () => {
    const usuario = new Usuario('u2', 'Luis', 'luis@empresa.com', UserRole.ASESOR, true);
    expect(
      usuario.puedeAccederA([UserRole.ADMINISTRADOR, UserRole.ASESOR]),
    ).toBe(true);
  });

  it('no deja entrar a un usuario desactivado aunque tenga el rol', () => {
    const usuario = new Usuario('u1', 'Mateo', 'mateo@empresa.com', UserRole.ADMINISTRADOR, false);
    expect(usuario.puedeAccederA([UserRole.ADMINISTRADOR])).toBe(false);
  });

  it('reconoce al asesor', () => {
    const asesor = new Usuario('u2', 'Luis', 'luis@empresa.com', UserRole.ASESOR, true);
    const lider = new Usuario('u3', 'Sara', 'sara@empresa.com', UserRole.LIDER, true);
    expect(asesor.esAsesor()).toBe(true);
    expect(lider.esAsesor()).toBe(false);
  });
});
