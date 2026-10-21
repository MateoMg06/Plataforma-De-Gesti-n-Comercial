import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCliente } from '../domain/estado-cliente.js';
import {
  ESTADO_CLIENTE_REPOSITORY,
  type EstadoClienteRepository,
} from '../domain/estado-cliente.repository.js';

@Injectable()
export class EditarEstadoClienteUseCase {
  constructor(
    @Inject(ESTADO_CLIENTE_REPOSITORY)
    private readonly opciones: EstadoClienteRepository,
  ) {}

  async ejecutar(id: number, nombre: string): Promise<EstadoCliente> {
    const actual = await this.opciones.buscarPorId(id);
    if (!actual) throw new NotFoundException('El estado de cliente no existe');
    let opcion: EstadoCliente;
    try {
      opcion = actual.editar(nombre);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const repetida = await this.opciones.buscarPorNombre(opcion.nombre);
    if (repetida && repetida.id !== id)
      throw new ConflictException(
        'Ya existe un estado de cliente con ese nombre',
      );
    return this.opciones.guardar(opcion);
  }
}
