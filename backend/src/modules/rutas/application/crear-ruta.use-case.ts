import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Ruta } from '../domain/ruta.js';
import { RUTA_REPOSITORY, type RutaRepository } from '../domain/ruta.repository.js';

// Caso de uso: crea rutas en estado inicial planeada y las guarda por el puerto.
@Injectable()
export class CrearRutaUseCase {
  constructor(@Inject(RUTA_REPOSITORY) private readonly rutas: RutaRepository) {}

  ejecutar(
    nombre: string,
    idAsesor: number,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<Ruta> {
    let ruta: Ruta;
    try {
      ruta = Ruta.crear(nombre, idAsesor, fechaInicio, fechaFin);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.rutas.guardar(ruta);
  }
}
