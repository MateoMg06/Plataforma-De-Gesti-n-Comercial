import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Tabla PORTAFOLIO del modelo (HU-09).
@Entity('portafolio')
export class PortafolioOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_portafolio' })
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ length: 255, default: '' })
  descripcion: string;
}
