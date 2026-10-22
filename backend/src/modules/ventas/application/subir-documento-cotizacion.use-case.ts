import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cotizacion } from '../domain/cotizacion.js';
import { COTIZACION_REPOSITORY, type CotizacionRepository } from '../domain/cotizacion.repository.js';
import { STORAGE_PORT, type StoragePort } from '../domain/storage.port.js';

@Injectable()
export class SubirDocumentoCotizacionUseCase {
  constructor(
    @Inject(COTIZACION_REPOSITORY) private readonly repo: CotizacionRepository,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  async ejecutar(id: number, contenido: Buffer, nombreArchivo: string, contentType: string): Promise<Cotizacion> {
    const cotizacion = await this.repo.buscarPorId(id);
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');

    const clave = `cotizaciones/${id}/${nombreArchivo}`;
    let guardadaClave: string;
    try {
      guardadaClave = await this.storage.subir(clave, contenido, contentType);
    } catch (e) {
      if (e instanceof Error) throw new BadRequestException(e.message);
      throw e;
    }

    const actualizada = cotizacion.conDocumento(guardadaClave);
    return this.repo.guardar(actualizada);
  }
}
