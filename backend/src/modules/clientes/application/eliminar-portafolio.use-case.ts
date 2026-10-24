import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PORTAFOLIO_REPOSITORY,
  type PortafolioRepository,
} from '../domain/portafolio.repository.js';

// Igual que los demás catálogos (HU-08): no se borra si algún cliente lo tiene.
@Injectable()
export class EliminarPortafolioUseCase {
  constructor(
    @Inject(PORTAFOLIO_REPOSITORY)
    private readonly portafolios: PortafolioRepository,
  ) {}

  async ejecutar(id: number): Promise<void> {
    if (!(await this.portafolios.buscarPorId(id)))
      throw new NotFoundException('El portafolio no existe');
    if (!(await this.portafolios.eliminar(id)))
      throw new ConflictException(
        'No se puede eliminar un portafolio asignado a clientes',
      );
  }
}
