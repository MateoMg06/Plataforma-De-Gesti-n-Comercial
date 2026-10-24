import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ResultadoRegistrado } from '../domain/resultado-visita.js';
import { type EstadoResultado, type Visita } from '../domain/visita.js';
import { VISITA_REPOSITORY, type VisitaRepository } from '../domain/visita.repository.js';

// HU-19: registrar el resultado de una visita (fecha real, estado y resultados del catálogo).
@Injectable()
export class RegistrarResultadoVisitaUseCase {
  constructor(@Inject(VISITA_REPOSITORY) private readonly visitas: VisitaRepository) {}

  async ejecutar(
    idVisita: number,
    fechaReal: Date,
    estado: EstadoResultado,
    resultados: ResultadoRegistrado[],
  ): Promise<Visita> {
    const visita = await this.visitas.buscarPorId(idVisita);
    if (!visita) {
      throw new NotFoundException('La visita no existe');
    }
    // La entidad valida las reglas: una visita realizada no se puede editar.
    // Si la regla falla, se responde 400 con el mensaje (antes salía error 500).
    let actualizada: Visita;
    try {
      actualizada = visita.registrarResultado(fechaReal, estado);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const guardada = await this.visitas.guardar(actualizada);
    await this.visitas.guardarResultadosVisita(idVisita, resultados);
    return guardada;
  }
}
