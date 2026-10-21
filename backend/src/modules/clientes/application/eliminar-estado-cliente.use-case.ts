import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ESTADO_CLIENTE_REPOSITORY,
  type EstadoClienteRepository,
} from '../domain/estado-cliente.repository.js';

@Injectable()
export class EliminarEstadoClienteUseCase {
  constructor(
    @Inject(ESTADO_CLIENTE_REPOSITORY)
    private readonly opciones: EstadoClienteRepository,
  ) {}

  async ejecutar(id: number): Promise<void> {
    if (!(await this.opciones.buscarPorId(id)))
      throw new NotFoundException('El estado de cliente no existe');
    if (!(await this.opciones.eliminar(id)))
      throw new ConflictException(
        'No se puede eliminar un estado de cliente en uso',
      );
  }
}
