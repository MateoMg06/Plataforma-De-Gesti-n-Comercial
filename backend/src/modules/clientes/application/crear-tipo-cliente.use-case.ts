import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { TipoCliente } from '../domain/tipo-cliente.js';
import {
  TIPO_CLIENTE_REPOSITORY,
  type TipoClienteRepository,
} from '../domain/tipo-cliente.repository.js';

@Injectable()
export class CrearTipoClienteUseCase {
  constructor(
    @Inject(TIPO_CLIENTE_REPOSITORY)
    private readonly opciones: TipoClienteRepository,
  ) {}

  async ejecutar(nombre: string): Promise<TipoCliente> {
    let opcion: TipoCliente;
    try {
      opcion = TipoCliente.crear(nombre);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const repetida = await this.opciones.buscarPorNombre(opcion.nombre);
    if (repetida)
      throw new ConflictException(
        'Ya existe un tipo de cliente con ese nombre',
      );
    return this.opciones.guardar(opcion);
  }
}
