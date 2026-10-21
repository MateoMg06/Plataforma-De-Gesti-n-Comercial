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
});
