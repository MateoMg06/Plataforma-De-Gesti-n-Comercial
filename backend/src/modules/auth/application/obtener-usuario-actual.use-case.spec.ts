import { UserRole } from '../../../common/enums/domain.enums.js';
import { ObtenerUsuarioActualUseCase } from './obtener-usuario-actual.use-case.js';

describe('ObtenerUsuarioActualUseCase', () => {
  it('devuelve el usuario de la sesión con su rol', () => {
    const useCase = new ObtenerUsuarioActualUseCase();
    const usuario = useCase.ejecutar({
      id: 'u1',
      name: 'Mateo',
      email: 'mateo@empresa.com',
      rol: 'lider',
    });
    expect(usuario.id).toBe('u1');
    expect(usuario.nombre).toBe('Mateo');
    expect(usuario.correo).toBe('mateo@empresa.com');
    expect(usuario.rol).toBe(UserRole.LIDER);
  });

  it('deja activo al usuario cuando la sesión no trae el campo', () => {
    const useCase = new ObtenerUsuarioActualUseCase();
    const usuario = useCase.ejecutar({
      id: 'u1',
      name: 'Mateo',
      email: 'mateo@empresa.com',
    });
    expect(usuario.activo).toBe(true);
  });

  it('respeta un usuario desactivado', () => {
    const useCase = new ObtenerUsuarioActualUseCase();
    const usuario = useCase.ejecutar({
      id: 'u1',
      name: 'Mateo',
      email: 'mateo@empresa.com',
      rol: 'administrador',
      activo: false,
    });
    expect(usuario.activo).toBe(false);
  });
});
