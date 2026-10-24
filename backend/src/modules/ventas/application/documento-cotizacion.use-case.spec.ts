import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import { CotizacionEstado } from '../../../common/enums/domain.enums.js';
import { Cotizacion, CotizacionDetalle } from '../domain/cotizacion.js';
import type { CotizacionRepository } from '../domain/cotizacion.repository.js';
import { InMemoryStorageAdapter } from '../infrastructure/in-memory-storage.adapter.js';
import { DescargarDocumentoCotizacionUseCase } from './descargar-documento-cotizacion.use-case.js';
import { SubirDocumentoCotizacionUseCase } from './subir-documento-cotizacion.use-case.js';

// Una cotización (id 1) del asesor 1, guardada en memoria.
function preparar() {
  let cotizacion = new Cotizacion(1, 1001, 1, 1, new Date(), CotizacionEstado.BORRADOR, [
    CotizacionDetalle.crear('Laptop', 1, 1000),
  ]);
  const repo = {
    buscarPorId: async (id: number) => (id === 1 ? cotizacion : null),
    guardar: async (c: Cotizacion) => (cotizacion = c),
  } as unknown as CotizacionRepository;
  return { repo, storage: new InMemoryStorageAdapter() };
}

// La sesión u-laura es del asesor 1; u-carlos del asesor 2.
const porUsuario = {
  ejecutar: async (idUsuario: string) => ({ id: idUsuario === 'u-laura' ? 1 : 2 }),
} as unknown as ObtenerAsesorPorUsuarioUseCase;

const pdf = Buffer.from('%PDF-1.4 prueba');

describe('Documento de cotización (HU-29)', () => {
  it('sube el documento, guarda solo la referencia y se puede descargar', async () => {
    const { repo, storage } = preparar();
    const subida = await new SubirDocumentoCotizacionUseCase(repo, storage, porUsuario).ejecutar(
      1,
      pdf,
      'cotización final.pdf',
      'application/pdf',
    );
    expect(subida.documentoKey).toBe('cotizaciones/1/cotizaci_n_final.pdf');
    const doc = await new DescargarDocumentoCotizacionUseCase(repo, storage, porUsuario).ejecutar(1);
    expect(doc.contenido.toString()).toBe('%PDF-1.4 prueba');
  });

  it('rechaza sin archivo o con un tipo no permitido', async () => {
    const { repo, storage } = preparar();
    const subir = new SubirDocumentoCotizacionUseCase(repo, storage, porUsuario);
    await expect(subir.ejecutar(1, undefined, '', '')).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      subir.ejecutar(1, Buffer.from('x'), 'virus.exe', 'application/x-msdownload'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('el asesor solo maneja documentos de sus cotizaciones', async () => {
    const { repo, storage } = preparar();
    await expect(
      new SubirDocumentoCotizacionUseCase(repo, storage, porUsuario).ejecutar(
        1, pdf, 'a.pdf', 'application/pdf', { id: 'u-carlos', role: 'asesor' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new DescargarDocumentoCotizacionUseCase(repo, storage, porUsuario).ejecutar(1, { id: 'u-carlos', role: 'asesor' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('descargar sin documento responde 404', async () => {
    const { repo, storage } = preparar();
    await expect(
      new DescargarDocumentoCotizacionUseCase(repo, storage, porUsuario).ejecutar(1),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
