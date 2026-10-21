import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PortafolioDeCliente } from '../domain/portafolio.js';
import {
  PORTAFOLIO_REPOSITORY,
  type PortafolioRepository,
} from '../domain/portafolio.repository.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';

// HU-09: retirar una línea del portafolio de un cliente.
@Injectable()
export class RetirarPortafolioClienteUseCase {
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
    if (!(await this.portafolios.estaAsignado(idCliente, idPortafolio)))
      throw new NotFoundException('El cliente no tiene ese portafolio');
    await this.portafolios.retirar(idCliente, idPortafolio);
    return this.portafolios.listarDeCliente(idCliente);
  }
}
