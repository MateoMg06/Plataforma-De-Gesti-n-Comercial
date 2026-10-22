import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CONTACTO_CLIENTE_REPOSITORY,
  type ContactoClienteRepository,
} from '../domain/contacto-cliente.repository.js';

// HU-07: elimina un contacto del cliente.
@Injectable()
export class EliminarContactoUseCase {
  constructor(
    @Inject(CONTACTO_CLIENTE_REPOSITORY)
    private readonly contactos: ContactoClienteRepository,
  ) {}

  async ejecutar(idCliente: number, idContacto: number): Promise<void> {
    const actual = await this.contactos.buscarPorId(idContacto);
    if (!actual || actual.idCliente !== idCliente)
      throw new NotFoundException('El contacto no existe');
    await this.contactos.eliminar(idContacto);
  }
}
