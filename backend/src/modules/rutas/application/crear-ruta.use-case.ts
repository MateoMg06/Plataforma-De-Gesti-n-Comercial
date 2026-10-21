import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ObtenerAsesorUseCase } from '../../asesores/application/obtener-asesor.use-case.js';
import { Ruta } from '../domain/ruta.js';
import { RUTA_REPOSITORY, type RutaRepository } from '../domain/ruta.repository.js';

// Caso de uso: crea rutas en estado inicial planeada y las guarda por el puerto.
// Valida con el caso de uso de asesores (Mateo) que el asesor exista y esté activo.
@Injectable()
export class CrearRutaUseCase {
  constructor(
    @Inject(RUTA_REPOSITORY) private readonly rutas: RutaRepository,
    private readonly obtenerAsesor: ObtenerAsesorUseCase,
  ) {}

  async ejecutar(
    nombre: string,
    idAsesor: number,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<Ruta> {
    // Lanza 404 si el asesor no existe.
    const asesor = await this.obtenerAsesor.ejecutar(idAsesor);
    // HU-10: los asesores inactivos no reciben rutas nuevas.
    if (!asesor.puedeRecibirRutas()) {
      throw new BadRequestException('El asesor está inactivo y no puede recibir rutas');
    }
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
