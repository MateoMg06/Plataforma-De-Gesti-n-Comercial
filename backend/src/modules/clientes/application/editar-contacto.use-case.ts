import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CONTACTO_CLIENTE_REPOSITORY,
  type ContactoClienteRepository,
} from '../domain/contacto-cliente.repository.js';
import {
  ContactoCliente,
  type DatosContacto,
} from '../domain/contacto-cliente.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';
@Injectable()
export class EditarContactoUseCase {
  constructor(
    @Inject(CONTACTO_CLIENTE_REPOSITORY)
    private readonly contactos: ContactoClienteRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}
  async ejecutar(idCliente: number, id: number, datos: DatosContacto) {
    await this.obtenerCliente.ejecutar(idCliente);
    const existentes = await this.contactos.listar(idCliente);
    if (!existentes.some((c) => c.id === id))
      throw new NotFoundException('El contacto no existe para este cliente');
    let contacto: ContactoCliente;
    try {
      contacto = ContactoCliente.crear(idCliente, datos, existentes, id);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.contactos.guardar(contacto);
  }
}
