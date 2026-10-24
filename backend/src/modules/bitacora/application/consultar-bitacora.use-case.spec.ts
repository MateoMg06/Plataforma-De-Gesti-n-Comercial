import { BadRequestException } from '@nestjs/common';
import type { BitacoraRepository } from '../domain/bitacora.repository.js';
import { type FiltrosBitacora, RegistroBitacora } from '../domain/registro-bitacora.js';
import { ConsultarBitacoraUseCase } from './consultar-bitacora.use-case.js';

// Repositorio en memoria que aplica los mismos filtros que el de TypeORM.
class BitacoraRepositoryEnMemoria implements BitacoraRepository {
  registros = [
    new RegistroBitacora(1, 'u-laura', 'Laura', 'crear_cliente', 'clientes', new Date('2026-10-20T10:00:00'), ''),
    new RegistroBitacora(2, 'u-carlos', 'Carlos', 'crear_visita', 'visitas', new Date('2026-10-21T10:00:00'), ''),
    new RegistroBitacora(3, 'u-laura', 'Laura', 'crear_visita', 'visitas', new Date('2026-10-22T10:00:00'), ''),
  ];

  async consultar(f: FiltrosBitacora) {
    return this.registros
      .filter((r) => !f.usuarioId || r.usuarioId === f.usuarioId)
      .filter((r) => !f.accion || r.accion === f.accion)
      .filter((r) => !f.desde || r.fecha >= f.desde)
      .filter((r) => !f.hasta || r.fecha < f.hasta)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }
}

describe('ConsultarBitacoraUseCase (HU-25)', () => {
  const useCase = new ConsultarBitacoraUseCase(new BitacoraRepositoryEnMemoria());

  it('sin filtros devuelve todo, del más reciente al más antiguo', async () => {
    const resultado = await useCase.ejecutar({});
    expect(resultado.map((r) => r.id)).toEqual([3, 2, 1]);
  });

  it('combina los filtros de usuario y tipo de acción', async () => {
    const resultado = await useCase.ejecutar({ usuarioId: 'u-laura', accion: 'crear_visita' });
    expect(resultado.map((r) => r.id)).toEqual([3]);
  });

  it('rechaza un rango de fechas al revés', async () => {
    await expect(
      useCase.ejecutar({ desde: new Date('2026-10-22'), hasta: new Date('2026-10-20') }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
