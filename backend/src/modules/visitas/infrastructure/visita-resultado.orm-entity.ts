import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Tabla VISITA_RESULTADO: une una visita con varios resultados del catálogo,
// cada uno con su observación.
@Entity('visita_resultado')
export class VisitaResultadoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_visita_resultado' })
  id: number;

  @Column({ name: 'id_visita' })
  idVisita: number;

  @Column({ name: 'id_resultado' })
  idResultado: number;

  @Column({ length: 500 })
  observacion: string;
}
