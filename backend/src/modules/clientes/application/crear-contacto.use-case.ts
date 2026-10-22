import { Inject, Injectable, BadRequestException } from '@nestjs/common';
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
export class CrearContactoUseCase {
  constructor(
    @Inject(CONTACTO_CLIENTE_REPOSITORY)
    private readonly contactos: ContactoClienteRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}
  async ejecutar(idCliente: number, datos: DatosContacto) {
    await this.obtenerCliente.ejecutar(idCliente);
    const existentes = await this.contactos.listar(idCliente);
    let contacto: ContactoCliente;
    try {
      contacto = ContactoCliente.crear(idCliente, datos, existentes);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.contactos.guardar(contacto);
  }
}
