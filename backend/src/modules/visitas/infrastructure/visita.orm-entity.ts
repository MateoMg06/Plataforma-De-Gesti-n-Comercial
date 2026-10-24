import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Modelo de persistencia: refleja la tabla VISITA del modelo entidad-relación.
// Es distinto de la entidad de dominio a propósito.
@Entity('visita')
export class VisitaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_visita' })
  id: number;

  // Números simples por ahora: las tablas cliente y asesor no se referencian con
  // clave foránea desde aquí. La validación de cliente se hace por código (HU-18).
  @Column({ name: 'id_cliente' })
  idCliente: number;

  @Column({ name: 'id_asesor' })
  idAsesor: number;

  @Column({ name: 'id_ruta', type: 'integer', nullable: true })
  idRuta: number | null;

  // Fecha y hora: la agenda (HU-11) muestra la hora de cada visita.
  @Column({ name: 'fecha_programada', type: 'timestamp' })
  fechaProgramada: Date;

  // Se llena al registrar el resultado de la visita (HU-19).
  @Column({ name: 'fecha_real', type: 'timestamp', nullable: true })
  fechaReal: Date | null;

  @Column({ name: 'estado_visita', length: 20 })
  estadoVisita: string;

  // HU-13: motivo de la última reprogramación.
  @Column({ name: 'motivo_reprogramacion', type: 'varchar', length: 255, nullable: true })
  motivoReprogramacion: string | null;
}
