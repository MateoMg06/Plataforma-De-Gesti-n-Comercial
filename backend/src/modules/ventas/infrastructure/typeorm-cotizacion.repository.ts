import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CotizacionEstado } from '../../../common/enums/domain.enums.js';
import { Cotizacion, CotizacionDetalle } from '../domain/cotizacion.js';
import type { CotizacionRepository } from '../domain/cotizacion.repository.js';
import { CotizacionOrmEntity } from './cotizacion.orm-entity.js';
import { CotizacionDetalleOrmEntity } from './cotizacion-detalle.orm-entity.js';

@Injectable()
export class TypeOrmCotizacionRepository implements CotizacionRepository {
  constructor(
    @InjectRepository(CotizacionOrmEntity)
    private readonly repo: Repository<CotizacionOrmEntity>,
    @InjectRepository(CotizacionDetalleOrmEntity)
    private readonly detalleRepo: Repository<CotizacionDetalleOrmEntity>,
  ) {}

  async guardar(cotizacion: Cotizacion): Promise<Cotizacion> {
    // Con id es una actualización (por ejemplo, un cambio de estado).
    if (cotizacion.id) {
      await this.repo.update(cotizacion.id, {
        estado: cotizacion.estado,
        valor: cotizacion.total,
        documentoKey: cotizacion.documentoKey,
      });
      const fila = await this.repo.findOneBy({ id: cotizacion.id });
      return new Cotizacion(
        fila!.id,
        fila!.numero,
        fila!.idCliente,
        fila!.idAsesor,
        fila!.fecha,
        fila!.estado as CotizacionEstado,
        cotizacion.detalles,
        cotizacion.documentoKey,
      );
    }

    const fila = await this.repo.save({
      numero: cotizacion.numero,
      idCliente: cotizacion.idCliente,
      idAsesor: cotizacion.idAsesor,
      fecha: cotizacion.fecha,
       valor: cotizacion.total,
       estado: cotizacion.estado,
       documentoKey: cotizacion.documentoKey,
     });
    for (const d of cotizacion.detalles) {
      await this.detalleRepo.save({
        idCotizacion: fila.id,
        producto: d.producto,
        cantidad: d.cantidad,
        precio: d.precio,
        subtotal: d.subtotal,
      });
    }
    return new Cotizacion(
      fila.id,
      fila.numero,
      fila.idCliente,
      fila.idAsesor,
      fila.fecha,
      fila.estado as CotizacionEstado,
      cotizacion.detalles,
      cotizacion.documentoKey,
    );
  }

  async buscarPorId(id: number): Promise<Cotizacion | null> {
    const fila = await this.repo.findOneBy({ id });
    if (!fila) return null;
    const detalles = await this.detalleRepo.find({ where: { idCotizacion: id } });
      return new Cotizacion(
        fila.id,
        fila.numero,
        fila.idCliente,
        fila.idAsesor,
        fila.fecha,
        fila.estado as CotizacionEstado,
        detalles.map(
          (d) =>
            new CotizacionDetalle(
              d.id,
              d.producto,
              d.cantidad,
              Number(d.precio),
              Number(d.subtotal),
            ),
        ),
        fila.documentoKey,
      );
  }

  // Todas las cotizaciones con su detalle, la más reciente primero.
  async listar(): Promise<Cotizacion[]> {
    const filas = await this.repo.find({ order: { numero: 'DESC' } });
    const cotizaciones = await Promise.all(filas.map((fila) => this.buscarPorId(fila.id)));
    return cotizaciones.filter((c): c is Cotizacion => c !== null);
  }

  async obtenerSiguienteNumero(): Promise<number> {
    const max = await this.repo
      .createQueryBuilder('c')
      .select('COALESCE(MAX(c.numero), 0)', 'max')
      .getRawOne();
    return Number(max.max) + 1;
  }
}
