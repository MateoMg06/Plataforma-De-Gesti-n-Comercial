import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  TIPO_CLIENTE_REPOSITORY,
  type TipoClienteRepository,
} from '../domain/tipo-cliente.repository.js';

@Injectable()
export class EliminarTipoClienteUseCase {
  constructor(
    @Inject(TIPO_CLIENTE_REPOSITORY)
    private readonly opciones: TipoClienteRepository,
  ) {}

  async ejecutar(id: number): Promise<void> {
    if (!(await this.opciones.buscarPorId(id)))
      throw new NotFoundException('El tipo de cliente no existe');
    if (!(await this.opciones.eliminar(id)))
      throw new ConflictException(
        'No se puede eliminar un tipo de cliente en uso',
      );
  }
}
