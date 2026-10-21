import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Modelo de persistencia: refleja la tabla SEGUIMIENTO del modelo entidad-relación.
// Es distinto de la entidad de dominio a propósito.
// Las columnas usan snake_case para coincidir con la BD PostgreSQL.
@Entity('seguimiento')
export class SeguimientoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_seguimiento' })
  id: number;

  @Column({ name: 'id_visita' })
  id_visita: number;

  @Column({ name: 'fecha_proxima' })
  fecha_proxima: string;

  @Column({ name: 'actividad' })
  actividad: string;

  @Column({ name: 'observacion' })
  observacion: string;

  @Column({ name: 'completado', default: false })
  completado: boolean;

  @Column({ name: 'fecha_completado', type: 'timestamptz', nullable: true, default: null })
  fecha_completado: string | null;

  @Column({ name: 'completado_por', type: 'varchar', nullable: true, default: null })
  completado_por: string | null;
}