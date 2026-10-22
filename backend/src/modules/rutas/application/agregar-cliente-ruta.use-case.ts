import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ObtenerClienteUseCase } from '../../clientes/application/obtener-cliente.use-case.js';
import { RUTA_REPOSITORY, type RutaRepository } from '../domain/ruta.repository.js';

// Valida con el caso de uso de clientes (Francisco) que el cliente exista.
@Injectable()
export class AgregarClienteRutaUseCase {
  constructor(
    @Inject(RUTA_REPOSITORY) private readonly rutas: RutaRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}

  async ejecutar(idRuta: number, idCliente: number) {
    const ruta = await this.rutas.buscarPorId(idRuta);
    if (!ruta) throw new NotFoundException(`No existe la ruta ${idRuta}`);
    // Lanza 404 si el cliente no existe.
    await this.obtenerCliente.ejecutar(idCliente);
    try {
      ruta.agregarCliente(idCliente);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.rutas.guardar(ruta);
  }
}
