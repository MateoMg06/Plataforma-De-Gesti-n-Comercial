import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Modelo de persistencia: refleja la tabla VISITA del modelo entidad-relación.
// Es distinto de la entidad de dominio a propósito.
@Entity('visita')
export class VisitaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_visita' })
  id: number;

  // Números simples por ahora: las tablas cliente y asesor aún no existen en la
  // base de datos. Cuando existan, se agregan las claves foráneas en otra migración.
  @Column({ name: 'id_cliente' })
  idCliente: number;

  @Column({ name: 'id_asesor' })
  idAsesor: number;

  @Column({ name: 'id_ruta', nullable: true })
  idRuta: number | null;

  // Fecha y hora: la agenda (HU-11) muestra la hora de cada visita.
  @Column({ name: 'fecha_programada', type: 'timestamp' })
  fechaProgramada: Date;

  @Column({ name: 'estado_visita', length: 20 })
  estadoVisita: string;
}
