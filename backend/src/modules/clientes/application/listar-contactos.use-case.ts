import { Inject, Injectable } from '@nestjs/common';
import type { ContactoCliente } from '../domain/contacto-cliente.js';
import {
  CONTACTO_CLIENTE_REPOSITORY,
  type ContactoClienteRepository,
} from '../domain/contacto-cliente.repository.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';

// HU-07: contactos de un cliente, el principal primero.
@Injectable()
export class ListarContactosUseCase {
  constructor(
    @Inject(CONTACTO_CLIENTE_REPOSITORY)
    private readonly contactos: ContactoClienteRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}

  async ejecutar(idCliente: number): Promise<ContactoCliente[]> {
    await this.obtenerCliente.ejecutar(idCliente);
    return this.contactos.listarPorCliente(idCliente);
  }
}
