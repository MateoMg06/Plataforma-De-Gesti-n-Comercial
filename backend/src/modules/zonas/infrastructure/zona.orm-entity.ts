import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Modelo de persistencia: refleja la tabla ZONA del modelo entidad-relación.
// Es distinto de la entidad de dominio a propósito.
@Entity('zona')
export class ZonaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_zona' })
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;
}
