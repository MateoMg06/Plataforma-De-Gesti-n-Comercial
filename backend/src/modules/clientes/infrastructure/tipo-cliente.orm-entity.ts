import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_cliente')
export class TipoClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_tipo_cliente' })
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;
}
