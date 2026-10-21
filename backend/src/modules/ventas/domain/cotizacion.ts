import { CotizacionEstado } from '../../../common/enums/domain.enums.js';

// Entidad de dominio: TypeScript puro, sin NestJS ni TypeORM.
// Aquí viven las reglas del negocio de la cotización.
export class CotizacionDetalle {
  constructor(
    public readonly id: number | null,
    public readonly producto: string,
    public readonly cantidad: number,
    public readonly precio: number,
    public readonly subtotal: number,
  ) {
    if (!producto || producto.trim().length === 0) {
      throw new Error('El producto es obligatorio');
    }
    if (cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0');
    if (precio <= 0) throw new Error('El precio debe ser mayor a 0');
    if (Math.abs(subtotal - cantidad * precio) > 0.01) {
      throw new Error('El subtotal no coincide');
    }
  }

  static crear(producto: string, cantidad: number, precio: number): CotizacionDetalle {
    return new CotizacionDetalle(
      null,
      producto.trim(),
      cantidad,
      precio,
      cantidad * precio,
    );
  }
}

export class Cotizacion {
  public readonly detalles: CotizacionDetalle[];

  constructor(
    public readonly id: number | null,
    public readonly numero: number,
    public readonly idCliente: number,
    public readonly idAsesor: number,
    public readonly fecha: Date,
    public readonly estado: CotizacionEstado,
    detalles: CotizacionDetalle[],
  ) {
    if (idCliente <= 0) throw new Error('El cliente es obligatorio');
    if (idAsesor <= 0) throw new Error('El asesor es obligatorio');
    this.detalles = detalles;
  }

  // Total de la cotización: la suma de los subtotales del detalle.
  get total(): number {
    return this.detalles.reduce((acc, d) => acc + d.subtotal, 0);
  }

  agregarProducto(producto: string, cantidad: number, precio: number): void {
    this.detalles.push(CotizacionDetalle.crear(producto, cantidad, precio));
  }

  // Transiciones de estado (HU-28). Solo se puede editar en borrador.
  enviar(): Cotizacion {
    if (this.estado !== CotizacionEstado.BORRADOR) {
      throw new Error('Solo se puede enviar una cotización en borrador');
    }
    return this.conEstado(CotizacionEstado.ENVIADA);
  }

  aprobar(): Cotizacion {
    if (this.estado !== CotizacionEstado.ENVIADA) {
      throw new Error('Solo se puede aprobar una cotización enviada');
    }
    return this.conEstado(CotizacionEstado.APROBADA);
  }

  rechazar(): Cotizacion {
    if (this.estado !== CotizacionEstado.ENVIADA) {
      throw new Error('Solo se puede rechazar una cotización enviada');
    }
    return this.conEstado(CotizacionEstado.RECHAZADA);
  }

  static crear(
    numero: number,
    idCliente: number,
    idAsesor: number,
    detalles: CotizacionDetalle[],
  ): Cotizacion {
    return new Cotizacion(
      null,
      numero,
      idCliente,
      idAsesor,
      new Date(),
      CotizacionEstado.BORRADOR,
      detalles,
    );
  }

  private conEstado(estado: CotizacionEstado): Cotizacion {
    return new Cotizacion(
      this.id,
      this.numero,
      this.idCliente,
      this.idAsesor,
      this.fecha,
      estado,
      this.detalles,
    );
  }

  // El total vive en un getter, y JSON.stringify no serializa los getters.
  // Con este toJSON la API devuelve el total junto con el resto de la
  // cotización, sin duplicar el cálculo en la capa de presentación.
  toJSON() {
    return {
      id: this.id,
      numero: this.numero,
      idCliente: this.idCliente,
      idAsesor: this.idAsesor,
      fecha: this.fecha,
      estado: this.estado,
      total: this.total,
      detalles: this.detalles,
    };
  }
}
