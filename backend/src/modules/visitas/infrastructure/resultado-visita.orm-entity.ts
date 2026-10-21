import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Catálogo RESULTADO_VISITA: qué pasó en la visita (ej. "Cobro", "Demostración").
@Entity('resultado_visita')
export class ResultadoVisitaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_resultado' })
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;
}
