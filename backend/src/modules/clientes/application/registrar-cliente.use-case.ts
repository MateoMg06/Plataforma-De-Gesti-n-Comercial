import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cliente, type DatosCliente } from '../domain/cliente.js';
import {
  CLIENTE_REPOSITORY,
  type ClienteRepository,
} from '../domain/cliente.repository.js';
import { ObtenerZonaUseCase } from '../../zonas/application/obtener-zona.use-case.js';

@Injectable()
export class RegistrarClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository,
    private readonly obtenerZona: ObtenerZonaUseCase,
  ) {}

  async ejecutar(datos: DatosCliente): Promise<Cliente> {
    let cliente: Cliente;
    try {
      cliente = Cliente.crear(datos);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    if (await this.clientes.buscarPorNit(cliente.nit)) {
      throw new ConflictException('Ya existe un cliente con ese NIT');
    }
    if (await this.clientes.buscarPorEmail(cliente.email)) {
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
