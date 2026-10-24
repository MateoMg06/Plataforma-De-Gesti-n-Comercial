import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ClienteOrmEntity } from './cliente.orm-entity.js';
import { PortafolioOrmEntity } from './portafolio.orm-entity.js';

// Tabla CLIENTE_PORTAFOLIO del modelo (HU-09): relación N:M con fecha de registro.
// La llave primaria es la pareja (cliente, portafolio): no se repite.
@Entity('cliente_portafolio')
export class ClientePortafolioOrmEntity {
  @PrimaryColumn({ name: 'id_cliente' })
  idCliente: number;

  @PrimaryColumn({ name: 'id_portafolio' })
  idPortafolio: number;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamptz' })
  fechaRegistro: Date;

  // Si se borra el cliente, se borran sus asignaciones.
  @ManyToOne(() => ClienteOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteOrmEntity;

  // Un portafolio asignado a clientes no se puede borrar (HU-08).
  @ManyToOne(() => PortafolioOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_portafolio' })
  portafolio: PortafolioOrmEntity;
}
