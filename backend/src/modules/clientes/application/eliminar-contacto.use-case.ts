import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CONTACTO_CLIENTE_REPOSITORY,
  type ContactoClienteRepository,
} from '../domain/contacto-cliente.repository.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';
@Injectable()
export class EliminarContactoUseCase {
  constructor(
    @Inject(CONTACTO_CLIENTE_REPOSITORY)
    private readonly contactos: ContactoClienteRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}
  async ejecutar(idCliente: number, id: number) {
    await this.obtenerCliente.ejecutar(idCliente);
    const existentes = await this.contactos.listar(idCliente);
    if (!existentes.some((c) => c.id === id))
      throw new NotFoundException('El contacto no existe para este cliente');
    await this.contactos.eliminar(idCliente, id);
    return { mensaje: 'Contacto eliminado' };
  }
}
