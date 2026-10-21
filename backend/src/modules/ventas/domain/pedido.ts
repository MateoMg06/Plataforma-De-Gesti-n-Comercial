import { PedidoEstado } from '../../../common/enums/domain.enums.js';
import type { Cotizacion } from './cotizacion.js';

export class Pedido {
  constructor(
    public readonly id: number | null,
    public readonly numero: number,
    public readonly idCotizacion: number,
    public readonly idCliente: number,
    public readonly valor: number,
    public readonly estado: string,
    public readonly fecha: Date = new Date(),
  ) {
    if (idCotizacion <= 0) throw new Error('La cotización es obligatoria');
    if (idCliente <= 0) throw new Error('El cliente es obligatorio');
    if (valor <= 0) throw new Error('El valor debe ser mayor a 0');
  }

  static crear(numero: number, cotizacion: Cotizacion): Pedido {
    return new Pedido(null, numero, cotizacion.id!, cotizacion.idCliente, cotizacion.total, PedidoEstado.PENDIENTE, new Date());
  }

  toJSON() {
    return {
      id: this.id,
      numero: this.numero,
      idCotizacion: this.idCotizacion,
      idCliente: this.idCliente,
      valor: this.valor,
      estado: this.estado,
      fecha: this.fecha,
    };
  }
}
