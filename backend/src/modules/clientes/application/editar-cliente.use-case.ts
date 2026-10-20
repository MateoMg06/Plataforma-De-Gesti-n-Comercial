import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cliente, type DatosCliente } from '../domain/cliente.js';
import {
  CLIENTE_REPOSITORY,
  type ClienteRepository,
} from '../domain/cliente.repository.js';
import { ObtenerZonaUseCase } from '../../zonas/application/obtener-zona.use-case.js';

@Injectable()
export class EditarClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository,
    private readonly obtenerZona: ObtenerZonaUseCase,
  ) {}

  async ejecutar(id: number, datos: DatosCliente): Promise<Cliente> {
    const actual = await this.clientes.buscarPorId(id);
    if (!actual) throw new NotFoundException('El cliente no existe');
    let cliente: Cliente;
    try {
      cliente = actual.editar(datos);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    const porNit = await this.clientes.buscarPorNit(cliente.nit);
    if (porNit && porNit.id !== id) {
      throw new ConflictException('Ya existe un cliente con ese NIT');
    }
    const porEmail = await this.clientes.buscarPorEmail(cliente.email);
    if (porEmail && porEmail.id !== id) {
      throw new ConflictException('Ya existe un cliente con ese email');
    }
    await this.obtenerZona.ejecutar(cliente.idZona);
    if (!(await this.clientes.existeTipoCliente(cliente.idTipoCliente))) {
      throw new BadRequestException('El tipo de cliente no existe');
    }
    if (!(await this.clientes.existePotencial(cliente.idPotencial))) {
      throw new BadRequestException('El potencial no existe');
    }
    if (!(await this.clientes.existeEstadoCliente(cliente.idEstadoCliente))) {
      throw new BadRequestException('El estado de cliente no existe');
    }
    return this.clientes.guardar(cliente);
  }
}
