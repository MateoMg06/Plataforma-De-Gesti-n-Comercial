import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EstadoCliente } from '../domain/estado-cliente.js';
import {
  ESTADO_CLIENTE_REPOSITORY,
  type EstadoClienteRepository,
} from '../domain/estado-cliente.repository.js';

@Injectable()
export class CrearEstadoClienteUseCase {
  constructor(
    @Inject(ESTADO_CLIENTE_REPOSITORY)
    private readonly opciones: EstadoClienteRepository,
  ) {}

  async ejecutar(nombre: string): Promise<EstadoCliente> {
    let opcion: EstadoCliente;
    try {
      opcion = EstadoCliente.crear(nombre);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const repetida = await this.opciones.buscarPorNombre(opcion.nombre);
    if (repetida)
      throw new ConflictException(
        'Ya existe un estado de cliente con ese nombre',
      );
    return this.opciones.guardar(opcion);
  }
}
