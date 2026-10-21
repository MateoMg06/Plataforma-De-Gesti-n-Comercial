import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ZONA_REPOSITORY,
  type ZonaRepository,
} from '../domain/zona.repository.js';

@Injectable()
export class EliminarZonaUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY) private readonly zonas: ZonaRepository,
  ) {}

  async ejecutar(id: number): Promise<void> {
    if (!(await this.zonas.buscarPorId(id)))
      throw new NotFoundException('La zona no existe');
    if (!(await this.zonas.eliminar(id))) {
      throw new ConflictException('No se puede eliminar una zona en uso');
    }
  }
}
