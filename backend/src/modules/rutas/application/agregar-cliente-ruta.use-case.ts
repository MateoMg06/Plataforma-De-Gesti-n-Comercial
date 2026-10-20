import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RUTA_REPOSITORY, type RutaRepository } from '../domain/ruta.repository.js';

@Injectable()
export class AgregarClienteRutaUseCase {
  constructor(@Inject(RUTA_REPOSITORY) private readonly rutas: RutaRepository) {}

  async ejecutar(idRuta: number, idCliente: number) {
    const ruta = await this.rutas.buscarPorId(idRuta);
    if (!ruta) throw new NotFoundException(`No existe la ruta ${idRuta}`);
    try {
      ruta.agregarCliente(idCliente);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return this.rutas.guardar(ruta);
  }
}
