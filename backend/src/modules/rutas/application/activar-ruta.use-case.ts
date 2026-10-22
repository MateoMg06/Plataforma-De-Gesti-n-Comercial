import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProgramarVisitaUseCase } from '../../visitas/application/programar-visita.use-case.js';
import type { Ruta } from '../domain/ruta.js';
import { RUTA_REPOSITORY, type RutaRepository } from '../domain/ruta.repository.js';

// HU-16: activa una ruta y genera una visita por cada cliente.
// Las visitas se crean con el caso de uso que exporta Santiago (visitas):
// este módulo no inserta en la tabla VISITA directamente.
@Injectable()
export class ActivarRutaUseCase {
  constructor(
    @Inject(RUTA_REPOSITORY) private readonly rutas: RutaRepository,
    private readonly programarVisita: ProgramarVisitaUseCase,
  ) {}

  async ejecutar(idRuta: number): Promise<Ruta> {
    const ruta = await this.rutas.buscarPorId(idRuta);
    if (!ruta) throw new NotFoundException(`No existe la ruta ${idRuta}`);

    let activa: Ruta;
    try {
      activa = ruta.activar();
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const guardada = await this.rutas.guardar(activa);

    // Una visita por cliente el día de inicio, en el orden de la ruta:
    // la primera a las 8:00, la segunda a las 9:00, y así.
    for (const cliente of guardada.clientes) {
      const fecha = new Date(`${guardada.fechaInicio}T00:00:00`);
      fecha.setHours(7 + cliente.ordenVisita);
      await this.programarVisita.ejecutar(cliente.idCliente, guardada.idAsesor, fecha, guardada.id);
    }
    return guardada;
  }
}
