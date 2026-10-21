// Entidad TypeORM para la tabla de bitácora.
// Propiedad de Kevin B según modelo-datos.md.
// Almacena registros transaccionales de acciones clave del sistema.

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// Los valores de acción deben ser consistentes con el decorator RegistrarEnBitacora
export enum AccionBitacora {
  CREAR_CLIENTE = 'crear_cliente',
  EDITAR_CLIENTE = 'editar_cliente',
  CREAR_VISITA = 'crear_visita',
  EDITAR_VISITA = 'editar_visita',
  CREAR_COTIZACION = 'crear_cotizacion',
  EDITAR_COTIZACION = 'editar_cotizacion',
  CREAR_PEDIDO = 'crear_pedido',
  EDITAR_PEDIDO = 'editar_pedido',
  REPROGRAMAR_VISITA = 'reprogramar_visita',
  CREAR_SEGUIMIENTO = 'crear_seguimiento',
}

@Entity('bitacora')
export class BitacoraOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_bitacora' })
  id: number;

  // Id del usuario de BetterAuth: es texto, no número.
  @Column({ name: 'usuario_id', type: 'varchar', length: 100 })
  usuario_id: string;

  @Column({ name: 'usuario_nombre', length: 100 })
  usuario_nombre: string;

  @Column({ name: 'accion', length: 50 })
  accion: string;

  @Column({ name: 'modulo', length: 50 })
  modulo: string;

  @Column({ name: 'fecha', type: 'timestamp' })
  fecha: Date;

  @Column({ name: 'detalle', length: 255 })
  detalle: string;

  @Column({ name: 'ip', type: 'varchar', length: 45, nullable: true })
  ip: string | null;
}