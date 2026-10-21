import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Modelo de persistencia de RUTA. id_asesor apunta al módulo de asesores.
@Entity('ruta')
export class RutaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_ruta' })
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ name: 'id_asesor', type: 'integer' })
  idAsesor: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: string;

  @Column({ length: 20, default: 'planeada' })
  estado: 'planeada' | 'activa' | 'finalizada';
}
