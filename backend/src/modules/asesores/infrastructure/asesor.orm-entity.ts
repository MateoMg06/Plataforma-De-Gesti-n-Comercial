import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Modelo de persistencia: refleja la tabla ASESOR del modelo entidad-relación.
// Es distinto de la entidad de dominio a propósito.
@Entity('asesor')
export class AsesorOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_asesor' })
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 150, unique: true })
  correo: string;

  @Column({ length: 20 })
  telefono: string;

  // Valores: 'activo' | 'inactivo' (docs/modelo-datos.md).
  @Column({ length: 10, default: 'activo' })
  estado: string;

  // Une el asesor con su login de BetterAuth (HU-03). Es texto porque así es el id de "user".
  // Opcional: un asesor puede existir antes de tener usuario.
  @Column({ name: 'id_usuario', type: 'text', nullable: true })
  idUsuario: string | null;
}
