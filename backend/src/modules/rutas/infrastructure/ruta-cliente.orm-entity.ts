import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Modelo de persistencia de RUTA_CLIENTE. El orden se administra en el dominio.
@Entity('ruta_cliente')
@Unique('UQ_ruta_cliente_ruta_cliente', ['idRuta', 'idCliente'])
export class RutaClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_ruta_cliente' })
  id: number;

  @Column({ name: 'id_ruta', type: 'integer' })
  idRuta: number;

  @Column({ name: 'id_cliente', type: 'integer' })
  idCliente: number;

  @Column({ name: 'orden_visita', type: 'integer' })
  ordenVisita: number;
}
