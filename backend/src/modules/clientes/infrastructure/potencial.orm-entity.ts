import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('potencial')
export class PotencialOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_potencial' })
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: 'integer' })
  orden: number;
}
