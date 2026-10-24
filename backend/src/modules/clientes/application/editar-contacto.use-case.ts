import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ContactoCliente } from '../domain/contacto-cliente.js';
import {
  CONTACTO_CLIENTE_REPOSITORY,
  type ContactoClienteRepository,
} from '../domain/contacto-cliente.repository.js';
import type { DatosContacto } from './crear-contacto.use-case.js';

// HU-07: edita un contacto del cliente con las mismas reglas que al crearlo.
@Injectable()
export class EditarContactoUseCase {
  constructor(
    @Inject(CONTACTO_CLIENTE_REPOSITORY)
    private readonly contactos: ContactoClienteRepository,
  ) {}

  async ejecutar(
    idCliente: number,
    idContacto: number,
    datos: DatosContacto,
  ): Promise<ContactoCliente> {
    const actual = await this.contactos.buscarPorId(idContacto);
    if (!actual || actual.idCliente !== idCliente)
      throw new NotFoundException('El contacto no existe');
    const existentes = await this.contactos.listarPorCliente(idCliente);
    let editado: ContactoCliente;
    try {
      editado = actual.editar(
        datos.nombre,
        datos.cargo,
        datos.telefono,
        datos.celular,
        datos.email,
        datos.esPrincipal,
      );
      editado.validarPrincipalUnico(existentes);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.contactos.guardar(editado);
  }
}
