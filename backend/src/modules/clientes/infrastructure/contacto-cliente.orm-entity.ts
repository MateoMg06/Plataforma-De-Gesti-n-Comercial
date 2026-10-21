import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteOrmEntity } from './cliente.orm-entity.js';

// Tabla CONTACTO_CLIENTE (HU-07). Si se borra el cliente, se borran sus contactos.
@Entity('contacto_cliente')
export class ContactoClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_contacto' })
  id: number;

  @Column({ name: 'id_cliente' })
  idCliente: number;

  @ManyToOne(() => ClienteOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  cliente?: ClienteOrmEntity;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 100 })
  cargo: string;

  @Column({ length: 30 })
  telefono: string;

  @Column({ length: 30 })
  celular: string;

  @Column({ length: 254 })
  email: string;

  @Column({ name: 'es_principal', default: false })
  esPrincipal: boolean;
}
