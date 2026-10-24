import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import type { Visita } from '../domain/visita.js';
import { VISITA_REPOSITORY, type VisitaRepository } from '../domain/visita.repository.js';

// HU-13: reprogramar una visita (nueva fecha + motivo). Lo exporta este módulo para
// que la agenda (Mateo) lo use sin tocar el repositorio de visitas.
@Injectable()
export class ReprogramarVisitaUseCase {
  constructor(
    @Inject(VISITA_REPOSITORY) private readonly visitas: VisitaRepository,
    private readonly obtenerAsesorPorUsuario: ObtenerAsesorPorUsuarioUseCase,
  ) {}

  async ejecutar(
    idVisita: number,
    nuevaFecha: Date,
    motivo: string,
    usuario?: { id: string; role?: string | null },
  ): Promise<Visita> {
    const visita = await this.visitas.buscarPorId(idVisita);
    if (!visita) throw new NotFoundException('La visita no existe');

    // HU-03: el asesor solo puede reprogramar sus propias visitas.
    if (usuario?.role === 'asesor') {
      const asesor = await this.obtenerAsesorPorUsuario.ejecutar(usuario.id);
      if (asesor.id !== visita.idAsesor) {
        throw new ForbiddenException('Solo puedes reprogramar tus visitas');
      }
    }

    // La entidad valida las reglas (visita pendiente, fecha y motivo): si fallan, 400.
    let reprogramada: Visita;
    try {
      reprogramada = visita.reprogramar(nuevaFecha, motivo);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.visitas.guardar(reprogramada);
  }
}
