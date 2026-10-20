import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  POTENCIAL_REPOSITORY,
  type PotencialRepository,
} from '../domain/potencial.repository.js';

@Injectable()
export class EliminarPotencialUseCase {
  constructor(
    @Inject(POTENCIAL_REPOSITORY)
    private readonly opciones: PotencialRepository,
  ) {}

  async ejecutar(id: number): Promise<void> {
    if (!(await this.opciones.buscarPorId(id)))
      throw new NotFoundException('El potencial no existe');
    if (!(await this.opciones.eliminar(id)))
      throw new ConflictException('No se puede eliminar un potencial en uso');
  }
}
