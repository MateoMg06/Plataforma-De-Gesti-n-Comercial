import { AsesorEstado } from '../../../common/enums/domain.enums.js';
import { Asesor } from './asesor.js';

describe('Asesor', () => {
  it('se crea activo y con el correo normalizado', () => {
    const asesor = Asesor.crear(
      ' Ana Pérez ',
      ' Ana@Correo.com ',
      ' 3001234567 ',
    );
    expect(asesor.nombre).toBe('Ana Pérez');
    expect(asesor.correo).toBe('ana@correo.com');
    expect(asesor.estado).toBe(AsesorEstado.ACTIVO);
  });

  it('un asesor activo puede recibir rutas', () => {
    const asesor = Asesor.crear('Ana', 'ana@correo.com', '3001234567');
    expect(asesor.puedeRecibirRutas()).toBe(true);
  });

  it('un asesor inactivo no puede recibir rutas', () => {
    const asesor = new Asesor(
      1,
      'Ana',
      'ana@correo.com',
      '3001234567',
      AsesorEstado.INACTIVO,
    );
    expect(asesor.puedeRecibirRutas()).toBe(false);
  });

  it('exige nombre', () => {
    expect(() => Asesor.crear('  ', 'ana@correo.com', '3001234567')).toThrow(
      'obligatorio',
    );
  });

  it('exige correo y teléfono', () => {
    expect(() => Asesor.crear('Ana', ' ', '3001234567')).toThrow('correo');
    expect(() => Asesor.crear('Ana', 'ana@correo.com', ' ')).toThrow(
      'teléfono',
    );
  });

  it('al actualizar conserva el id y el estado', () => {
    const asesor = new Asesor(
      1,
      'Ana',
      'ana@correo.com',
      '3001234567',
      AsesorEstado.INACTIVO,
    );
    const actualizado = asesor.actualizar('Ana María', 'ANA@correo.com', '311');
    expect(actualizado.id).toBe(1);
    expect(actualizado.correo).toBe('ana@correo.com');
    expect(actualizado.estado).toBe(AsesorEstado.INACTIVO);
  });

  it('al inactivarlo deja de recibir rutas', () => {
    const asesor = Asesor.crear('Ana', 'ana@correo.com', '3001234567');
    const inactivo = asesor.cambiarEstado(AsesorEstado.INACTIVO);
    expect(inactivo.puedeRecibirRutas()).toBe(false);
  });
});
