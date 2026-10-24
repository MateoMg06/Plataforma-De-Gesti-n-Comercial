import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PortafolioDeCliente } from '../domain/portafolio.js';
import {
  PORTAFOLIO_REPOSITORY,
  type PortafolioRepository,
} from '../domain/portafolio.repository.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';

// HU-09: agregar una línea del portafolio a un cliente (queda con la fecha de hoy).
@Injectable()
export class AgregarPortafolioClienteUseCase {
  constructor(
    @Inject(PORTAFOLIO_REPOSITORY)
    private readonly portafolios: PortafolioRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}

  async ejecutar(
    idCliente: number,
    idPortafolio: number,
  ): Promise<PortafolioDeCliente[]> {
    // Lanza 404 si el cliente no existe.
    await this.obtenerCliente.ejecutar(idCliente);
    if (!(await this.portafolios.buscarPorId(idPortafolio)))
      throw new NotFoundException('El portafolio no existe');
    // Un cliente no tiene dos veces la misma línea. Consulta la base: va aquí.
    if (await this.portafolios.estaAsignado(idCliente, idPortafolio))
      throw new ConflictException('El cliente ya tiene ese portafolio');
    await this.portafolios.asignar(idCliente, idPortafolio);
    return this.portafolios.listarDeCliente(idCliente);
  }
}
