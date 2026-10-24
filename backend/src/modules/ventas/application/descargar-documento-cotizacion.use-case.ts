import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
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
    private readonly obtenerAsesorPorUsuario: ObtenerAsesorPorUsuarioUseCase,
  ) {}

  async ejecutar(
    id: number,
    usuario?: { id: string; role?: string | null },
  ): Promise<DocumentoDescargado> {
    const cotizacion = await this.repo.buscarPorId(id);
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    // HU-29 "según el rol": el asesor solo descarga documentos de sus cotizaciones.
    if (usuario?.role === 'asesor') {
      const asesor = await this.obtenerAsesorPorUsuario.ejecutar(usuario.id);
      if (asesor.id !== cotizacion.idAsesor)
        throw new ForbiddenException('Solo puedes ver documentos de tus cotizaciones');
    }
    if (!cotizacion.documentoKey) throw new NotFoundException('La cotización no tiene documento');

    const archivo = await this.storage.descargar(cotizacion.documentoKey);
    if (!archivo) throw new NotFoundException('Documento no encontrado en el almacenamiento');

    const nombreArchivo = cotizacion.documentoKey.split('/').pop() ?? 'documento';
    return { contenido: archivo.contenido, contentType: archivo.contentType, nombreArchivo };
  }
}
