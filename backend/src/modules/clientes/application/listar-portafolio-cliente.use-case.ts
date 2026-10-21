import { Inject, Injectable } from '@nestjs/common';
import type { PortafolioDeCliente } from '../domain/portafolio.js';
import {
  PORTAFOLIO_REPOSITORY,
  type PortafolioRepository,
} from '../domain/portafolio.repository.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';

// HU-09: el portafolio que tiene un cliente, con su fecha de registro.
@Injectable()
export class ListarPortafolioClienteUseCase {
  constructor(
    @Inject(PORTAFOLIO_REPOSITORY)
    private readonly portafolios: PortafolioRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}

  async ejecutar(idCliente: number): Promise<PortafolioDeCliente[]> {
    // Lanza 404 si el cliente no existe.
    await this.obtenerCliente.ejecutar(idCliente);
    return this.portafolios.listarDeCliente(idCliente);
  }
}
