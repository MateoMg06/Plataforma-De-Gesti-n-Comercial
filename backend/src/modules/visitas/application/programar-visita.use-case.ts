import { Inject, Injectable } from '@nestjs/common';
import { ObtenerAsesorUseCase } from '../../asesores/application/obtener-asesor.use-case.js';
import { ObtenerClienteUseCase } from '../../clientes/application/obtener-cliente.use-case.js';
import { Visita } from '../domain/visita.js';
import { VISITA_REPOSITORY, type VisitaRepository } from '../domain/visita.repository.js';

// Caso de uso: una acción del usuario. Orquesta el dominio a través del puerto.
// Usa los casos de uso de clientes (Francisco) y asesores (Mateo) para validar que
// el cliente y el asesor existen: un módulo no toca el repositorio de otro módulo.
@Injectable()
export class ProgramarVisitaUseCase {
  constructor(
    @Inject(VISITA_REPOSITORY) private readonly visitas: VisitaRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
    private readonly obtenerAsesor: ObtenerAsesorUseCase,
  ) {}

  async ejecutar(
    idCliente: number,
    idAsesor: number,
    fechaProgramada: Date,
    idRuta: number | null = null,
  ): Promise<Visita> {
    await this.obtenerCliente.ejecutar(idCliente);
    await this.obtenerAsesor.ejecutar(idAsesor);
    const visita = Visita.crear(idCliente, idAsesor, fechaProgramada, idRuta);
    return this.visitas.guardar(visita);
  }
}
