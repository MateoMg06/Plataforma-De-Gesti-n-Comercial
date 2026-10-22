import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteOrmEntity } from './cliente.orm-entity.js';
@Entity('contacto_cliente')
@Index('UQ_contacto_principal_cliente', ['idCliente'], {
  unique: true,
  where: '"principal" = true',
})
export class ContactoClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_contacto_cliente' })
  id: number;
  @Column({ name: 'id_cliente', type: 'integer' })
  idCliente: number;
  @Column({ length: 200 })
  nombre: string;
  @Column({ length: 100 })
  cargo: string;
  @Column({ length: 30 })
  telefono: string;
  @Column({ length: 30 })
  celular: string;
  @Column({ length: 254 })
  email: string;
  @Column({ default: false })
  principal: boolean;
  @ManyToOne(() => ClienteOrmEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteOrmEntity;
}
