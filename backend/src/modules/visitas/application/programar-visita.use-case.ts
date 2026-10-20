import { Inject, Injectable } from '@nestjs/common';
import { Visita } from '../domain/visita.js';
import { VISITA_REPOSITORY, type VisitaRepository } from '../domain/visita.repository.js';

// Caso de uso: una acción del usuario. Orquesta el dominio a través del puerto.
@Injectable()
export class ProgramarVisitaUseCase {
  constructor(@Inject(VISITA_REPOSITORY) private readonly visitas: VisitaRepository) {}

  async ejecutar(
    idCliente: number,
    idAsesor: number,
    fechaProgramada: Date,
    idRuta: number | null = null,
  ): Promise<Visita> {
    const visita = Visita.crear(idCliente, idAsesor, fechaProgramada, idRuta);
    return this.visitas.guardar(visita);
  }
}
