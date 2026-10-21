import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cotizacion')
export class CotizacionOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_cotizacion' })
  id: number;

  @Column({ unique: true })
  numero: number;

  @Column({ name: 'id_cliente' })
  idCliente: number;

  @Column({ name: 'id_asesor' })
  idAsesor: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'numeric' })
  valor: number;

  @Column({ length: 20 })
  estado: string;

  @Column({ name: 'documento_key', nullable: true })
  documentoKey: string | null;
}
