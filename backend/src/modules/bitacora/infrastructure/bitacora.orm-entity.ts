import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Entidad TypeORM de la tabla "bitacora" (dueña: módulo bitacora).
// Guarda quién hizo qué y cuándo, para las acciones marcadas con
// @RegistrarEnBitacora.
@Entity('bitacora')
export class BitacoraOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_bitacora' })
  id: number;

  // Es texto porque así es el id de la tabla "user" de BetterAuth.
  @Column({ name: 'usuario_id', type: 'text' })
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
