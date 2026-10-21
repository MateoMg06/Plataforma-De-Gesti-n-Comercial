import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    if (cotizacion.id) {
      await this.repo.update(cotizacion.id, {
        estado: cotizacion.estado,
        valor: cotizacion.total,
      });
      const fila = await this.repo.findOneBy({ id: cotizacion.id });
      return new Cotizacion(
        fila!.id,
        fila!.numero,
        fila!.idCliente,
        fila!.idAsesor,
        fila!.fecha,
        fila!.estado,
        cotizacion.detalles,
      );
    }
    const fila = await this.repo.save({
      numero: cotizacion.numero,
      idCliente: cotizacion.idCliente,
      idAsesor: cotizacion.idAsesor,
      fecha: cotizacion.fecha,
      valor: cotizacion.total,
      estado: cotizacion.estado,
      documentoKey: null,
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
      fila.estado,
      cotizacion.detalles.map((d) => d),
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
      fila.estado,
      detalles.map((d) => new CotizacionDetalle(d.id, d.producto, d.cantidad, Number(d.precio), Number(d.subtotal))),
    );
  }

  async obtenerSiguienteNumero(): Promise<number> {
    const max = await this.repo
      .createQueryBuilder('c')
      .select('COALESCE(MAX(c.numero), 0)', 'max')
      .getRawOne();
    return Number(max.max) + 1;
  }
}
