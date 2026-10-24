import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ZonaOrmEntity } from '../../zonas/infrastructure/zona.orm-entity.js';
import { TipoClienteOrmEntity } from './tipo-cliente.orm-entity.js';
import { PotencialOrmEntity } from './potencial.orm-entity.js';
import { EstadoClienteOrmEntity } from './estado-cliente.orm-entity.js';

@Entity('cliente')
export class ClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  id: number;

  @Column({ length: 30, unique: true })
  nit: string;

  @Column({ name: 'razon_social', length: 200 })
  razonSocial: string;

  @Column({ name: 'nombre_comercial', length: 200 })
  nombreComercial: string;

  @Column({ length: 250 })
  direccion: string;

  @Column({ length: 100 })
  departamento: string;

  @Column({ length: 100 })
  municipio: string;

  @Column({ length: 100 })
  barrio: string;

  @Column({ length: 30 })
  telefono: string;

  @Column({ length: 254, unique: true })
  email: string;

  @Column({ name: 'id_zona', type: 'integer' })
  idZona: number;

  @Column({ name: 'id_tipo_cliente', type: 'integer' })
  idTipoCliente: number;

  @Column({ name: 'id_potencial', type: 'integer' })
  idPotencial: number;

  @Column({ name: 'id_estado_cliente', type: 'integer' })
  idEstadoCliente: number;

  @Column({ name: 'frecuencia_visita_dias', type: 'integer' })
  frecuenciaVisitaDias: number;

  @Column({ type: 'double precision' })
  latitud: number;

  @Column({ type: 'double precision' })
  longitud: number;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion: Date;

  @Column({ default: true })
  activo: boolean;

  @ManyToOne(() => ZonaOrmEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_zona' })
  zona: ZonaOrmEntity;

  @ManyToOne(() => TipoClienteOrmEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_tipo_cliente' })
  tipoCliente: TipoClienteOrmEntity;

  @ManyToOne(() => PotencialOrmEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_potencial' })
  potencial: PotencialOrmEntity;

  @ManyToOne(() => EstadoClienteOrmEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_estado_cliente' })
  estadoCliente: EstadoClienteOrmEntity;
}
