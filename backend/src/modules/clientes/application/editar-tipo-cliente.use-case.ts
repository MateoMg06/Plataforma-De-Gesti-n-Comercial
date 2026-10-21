import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TipoCliente } from '../domain/tipo-cliente.js';
import {
  TIPO_CLIENTE_REPOSITORY,
  type TipoClienteRepository,
} from '../domain/tipo-cliente.repository.js';

@Injectable()
export class EditarTipoClienteUseCase {
  constructor(
    @Inject(TIPO_CLIENTE_REPOSITORY)
    private readonly opciones: TipoClienteRepository,
  ) {}

  async ejecutar(id: number, nombre: string): Promise<TipoCliente> {
    const actual = await this.opciones.buscarPorId(id);
    if (!actual) throw new NotFoundException('El tipo de cliente no existe');
    let opcion: TipoCliente;
    try {
      opcion = actual.editar(nombre);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const repetida = await this.opciones.buscarPorNombre(opcion.nombre);
    if (repetida && repetida.id !== id)
      throw new ConflictException(
        'Ya existe un tipo de cliente con ese nombre',
      );
    return this.opciones.guardar(opcion);
  }
}
