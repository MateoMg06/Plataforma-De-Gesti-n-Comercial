import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pedido')
export class PedidoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_pedido' })
  id: number;

  @Column({ unique: true })
  numero: number;

  @Column({ name: 'id_cotizacion' })
  idCotizacion: number;

  @Column({ name: 'id_cliente' })
  idCliente: number;

  @Column({ type: 'numeric' })
  valor: number;

  @Column({ length: 20 })
  estado: string;

  @Column({ type: 'timestamp' })
  fecha: Date;
}
