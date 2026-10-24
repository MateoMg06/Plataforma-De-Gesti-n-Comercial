import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import { Cotizacion } from '../domain/cotizacion.js';
import { COTIZACION_REPOSITORY, type CotizacionRepository } from '../domain/cotizacion.repository.js';
import { STORAGE_PORT, type StoragePort } from '../domain/storage.port.js';

// HU-29: tipos y tamaño permitidos para el documento de una cotización.
const TIPOS_PERMITIDOS = ['application/pdf', 'image/png', 'image/jpeg'];
const TAMANO_MAXIMO = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class SubirDocumentoCotizacionUseCase {
  constructor(
    @Inject(COTIZACION_REPOSITORY) private readonly repo: CotizacionRepository,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
    private readonly obtenerAsesorPorUsuario: ObtenerAsesorPorUsuarioUseCase,
  ) {}

  async ejecutar(
    id: number,
    contenido: Buffer | undefined,
    nombreArchivo: string,
    contentType: string,
    usuario?: { id: string; role?: string | null },
  ): Promise<Cotizacion> {
    if (!contenido || contenido.length === 0) throw new BadRequestException('Adjunta un archivo');
    if (!TIPOS_PERMITIDOS.includes(contentType))
      throw new BadRequestException('Solo se permiten archivos PDF, PNG o JPG');
    if (contenido.length > TAMANO_MAXIMO) throw new BadRequestException('El archivo supera 10 MB');

    const cotizacion = await this.repo.buscarPorId(id);
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    // HU-29 / HU-03: el asesor solo maneja documentos de sus cotizaciones.
    if (usuario?.role === 'asesor') {
      const asesor = await this.obtenerAsesorPorUsuario.ejecutar(usuario.id);
      if (asesor.id !== cotizacion.idAsesor)
        throw new ForbiddenException('Solo puedes manejar documentos de tus cotizaciones');
    }

    // El nombre va en la clave del archivo: se quitan caracteres raros (por ejemplo "/").
    const nombreSeguro = nombreArchivo.replace(/[^\w.-]/g, '_');
    const clave = `cotizaciones/${id}/${nombreSeguro}`;
    let guardadaClave: string;
    try {
      guardadaClave = await this.storage.subir(clave, contenido, contentType);
    } catch (e) {
      if (e instanceof Error) throw new BadRequestException(e.message);
      throw e;
    }

    // La base guarda solo la referencia (documento_key); el archivo vive en S3.
    const actualizada = cotizacion.conDocumento(guardadaClave);
    return this.repo.guardar(actualizada);
  }
}
