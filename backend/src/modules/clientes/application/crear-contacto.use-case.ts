import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ContactoCliente } from '../domain/contacto-cliente.js';
import {
  CONTACTO_CLIENTE_REPOSITORY,
  type ContactoClienteRepository,
} from '../domain/contacto-cliente.repository.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';

export interface DatosContacto {
  nombre: string;
  cargo: string;
  telefono: string;
  celular: string;
  email: string;
  esPrincipal: boolean;
}

// HU-07: agrega un contacto a un cliente.
@Injectable()
export class CrearContactoUseCase {
  constructor(
    @Inject(CONTACTO_CLIENTE_REPOSITORY)
    private readonly contactos: ContactoClienteRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}

  async ejecutar(idCliente: number, datos: DatosContacto): Promise<ContactoCliente> {
    // Lanza 404 si el cliente no existe.
    await this.obtenerCliente.ejecutar(idCliente);
    const existentes = await this.contactos.listarPorCliente(idCliente);
    let contacto: ContactoCliente;
    try {
      contacto = ContactoCliente.crear(
        idCliente,
        datos.nombre,
        datos.cargo,
        datos.telefono,
        datos.celular,
        datos.email,
        datos.esPrincipal,
      );
      contacto.validarPrincipalUnico(existentes);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.contactos.guardar(contacto);
  }
}
