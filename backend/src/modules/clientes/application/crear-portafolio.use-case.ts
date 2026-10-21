import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Portafolio } from '../domain/portafolio.js';
import {
  PORTAFOLIO_REPOSITORY,
  type PortafolioRepository,
} from '../domain/portafolio.repository.js';

// HU-09: crear una línea del portafolio. El nombre no se repite.
@Injectable()
export class CrearPortafolioUseCase {
  constructor(
    @Inject(PORTAFOLIO_REPOSITORY)
    private readonly portafolios: PortafolioRepository,
  ) {}

  async ejecutar(nombre: string, descripcion: string): Promise<Portafolio> {
    let portafolio: Portafolio;
    try {
      portafolio = Portafolio.crear(nombre, descripcion);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    if (await this.portafolios.buscarPorNombre(portafolio.nombre))
      throw new ConflictException('Ya existe un portafolio con ese nombre');
    return this.portafolios.guardar(portafolio);
  }
}
