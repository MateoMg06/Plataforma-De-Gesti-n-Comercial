import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cotizacion_detalle')
export class CotizacionDetalleOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_detalle' })
  id: number;

  @Column({ name: 'id_cotizacion' })
  idCotizacion: number;

  @Column({ length: 200 })
  producto: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'numeric' })
  precio: number;

  @Column({ type: 'numeric' })
  subtotal: number;
}
