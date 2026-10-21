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
    if (precio <= 0) throw new Error('El precio no puede ser negativo');
    if (subtotal !== cantidad * precio) {
      throw new Error('El subtotal no coincide');
    }
  }

  static crear(producto: string, cantidad: number, precio: number): CotizacionDetalle {
    return new CotizacionDetalle(null, producto.trim(), cantidad, precio, cantidad * precio);
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
    public readonly estado: string,
    detalles: CotizacionDetalle[],
  ) {
    if (idCliente <= 0) throw new Error('El cliente es obligatorio');
    if (idAsesor <= 0) throw new Error('El asesor es obligatorio');
    if (estado !== 'borrador') throw new Error('Estado inicial inválido');
    this.detalles = detalles;
  }

  get total(): number {
    return this.detalles.reduce((acc, d) => acc + d.subtotal, 0);
  }

  static crear(numero: number, idCliente: number, idAsesor: number, detalles: CotizacionDetalle[]): Cotizacion {
    return new Cotizacion(null, numero, idCliente, idAsesor, new Date(), 'borrador', detalles);
  }
}
