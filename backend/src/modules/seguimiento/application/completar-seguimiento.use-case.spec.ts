import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Seguimiento } from '../domain/seguimiento.js';
import type { SeguimientoRepository } from '../domain/seguimiento.repository.js';
import { CompletarSeguimientoUseCase } from './completar-seguimiento.use-case.js';

// Repositorio en memoria con un seguimiento pendiente (id 1).
class SeguimientoRepositoryEnMemoria implements SeguimientoRepository {
  seguimientos = [new Seguimiento(1, 1, '2026-10-20', 'Llamar al cliente', '', false, null, null)];

  async guardar(seguimiento: Seguimiento) {
    this.seguimientos = this.seguimientos.map((s) => (s.id === seguimiento.id ? seguimiento : s));
    return seguimiento;
  }

  async listar() {
    return this.seguimientos;
  }

  async buscarPorId(id: number) {
    return this.seguimientos.find((s) => s.id === id) ?? null;
  }
}

describe('CompletarSeguimientoUseCase (HU-24)', () => {
  it('marca completado y registra fecha y usuario', async () => {
    const repo = new SeguimientoRepositoryEnMemoria();
    const resultado = await new CompletarSeguimientoUseCase(repo).ejecutar(1, 'u-laura');
    expect(resultado.completado).toBe(true);
    expect(resultado.completado_por).toBe('u-laura');
    expect(resultado.fecha_completado).not.toBeNull();
  });

  it('no se puede completar dos veces', async () => {
    const useCase = new CompletarSeguimientoUseCase(new SeguimientoRepositoryEnMemoria());
    await useCase.ejecutar(1, 'u-laura');
    await expect(useCase.ejecutar(1, 'u-laura')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('responde 404 si el seguimiento no existe', async () => {
    const useCase = new CompletarSeguimientoUseCase(new SeguimientoRepositoryEnMemoria());
    await expect(useCase.ejecutar(99, 'u-laura')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('Seguimiento.estaVencido (HU-24)', () => {
  it('pendiente con fecha pasada está vencido; hoy o futura no', () => {
    const crear = (fecha: string) => new Seguimiento(1, 1, fecha, 'Llamar', '', false, null, null);
    expect(crear('2026-10-20').estaVencido('2026-10-23')).toBe(true);
    expect(crear('2026-10-23').estaVencido('2026-10-23')).toBe(false);
    expect(crear('2026-10-30').estaVencido('2026-10-23')).toBe(false);
  });

  it('un completado nunca está vencido', () => {
    const s = new Seguimiento(1, 1, '2026-10-01', 'Llamar', '', false, null, null).completar('u-laura', new Date());
    expect(s.estaVencido('2026-10-23')).toBe(false);
  });
});
