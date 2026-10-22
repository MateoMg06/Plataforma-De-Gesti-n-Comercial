import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COTIZACION_REPOSITORY, type CotizacionRepository } from '../domain/cotizacion.repository.js';
import { STORAGE_PORT, type StoragePort } from '../domain/storage.port.js';

export interface DocumentoDescargado {
  contenido: Buffer;
  contentType: string;
  nombreArchivo: string;
}

@Injectable()
export class DescargarDocumentoCotizacionUseCase {
  constructor(
    @Inject(COTIZACION_REPOSITORY) private readonly repo: CotizacionRepository,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  async ejecutar(id: number): Promise<DocumentoDescargado> {
    const cotizacion = await this.repo.buscarPorId(id);
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    if (!cotizacion.documentoKey) throw new NotFoundException('La cotización no tiene documento');

    const archivo = await this.storage.descargar(cotizacion.documentoKey);
    if (!archivo) throw new NotFoundException('Documento no encontrado en el almacenamiento');

    const nombreArchivo = cotizacion.documentoKey.split('/').pop() ?? 'documento';
    return { contenido: archivo.contenido, contentType: archivo.contentType, nombreArchivo };
  }
}
