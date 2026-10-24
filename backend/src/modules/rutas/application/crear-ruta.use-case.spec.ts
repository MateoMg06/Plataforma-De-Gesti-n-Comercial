import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ObtenerAsesorUseCase } from '../../asesores/application/obtener-asesor.use-case.js';
import { Asesor } from '../../asesores/domain/asesor.js';
import { AsesorEstado } from '../../../common/enums/domain.enums.js';
import type { Ruta } from '../domain/ruta.js';
import type { RutaRepository } from '../domain/ruta.repository.js';
import { CrearRutaUseCase } from './crear-ruta.use-case.js';

// Repositorio en memoria: el caso de uso se prueba sin base de datos.
class RutaRepositoryEnMemoria implements RutaRepository {
  rutas: Ruta[] = [];

  async guardar(ruta: Ruta) {
    this.rutas.push(ruta);
    return ruta;
  }

  async buscarPorId() {
    return null;
  }

  async listar() {
    return this.rutas;
  }
}

// Stub del caso de uso de asesores: 1 = activo, 2 = inactivo, otro = no existe.
class ObtenerAsesorStub {
  async ejecutar(id: number) {
    if (id === 1) return new Asesor(1, 'Laura', 'laura@correo.com', '3001234567', AsesorEstado.ACTIVO);
    if (id === 2) return new Asesor(2, 'Carlos', 'carlos@correo.com', '3001234568', AsesorEstado.INACTIVO);
    throw new NotFoundException(`No existe el asesor ${id}`);
  }
}

const crearUseCase = (repo = new RutaRepositoryEnMemoria()) =>
  new CrearRutaUseCase(repo, new ObtenerAsesorStub() as unknown as ObtenerAsesorUseCase);

describe('CrearRutaUseCase', () => {
  it('crea la ruta si el asesor existe y está activo', async () => {
    const repo = new RutaRepositoryEnMemoria();
    const ruta = await crearUseCase(repo).ejecutar('Ruta Norte', 1, '2026-10-26', '2026-10-30');
    expect(ruta.estado).toBe('planeada');
    expect(repo.rutas).toHaveLength(1);
  });

  it('rechaza un asesor que no existe', async () => {
    await expect(
      crearUseCase().ejecutar('Ruta Norte', 99, '2026-10-26', '2026-10-30'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza un asesor inactivo', async () => {
    await expect(
      crearUseCase().ejecutar('Ruta Norte', 2, '2026-10-26', '2026-10-30'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
