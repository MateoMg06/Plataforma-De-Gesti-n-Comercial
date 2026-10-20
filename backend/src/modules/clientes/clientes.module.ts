import { ListarOpcionesClienteUseCase } from './application/listar-opciones-cliente.use-case.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonasModule } from '../zonas/zonas.module.js';
import { RegistrarClienteUseCase } from './application/registrar-cliente.use-case.js';
import { ObtenerClienteUseCase } from './application/obtener-cliente.use-case.js';
import { CLIENTE_REPOSITORY } from './domain/cliente.repository.js';
import { ClienteOrmEntity } from './infrastructure/cliente.orm-entity.js';
import { TipoClienteOrmEntity } from './infrastructure/tipo-cliente.orm-entity.js';
import { PotencialOrmEntity } from './infrastructure/potencial.orm-entity.js';
import { EstadoClienteOrmEntity } from './infrastructure/estado-cliente.orm-entity.js';
import { TypeOrmClienteRepository } from './infrastructure/typeorm-cliente.repository.js';
import { ClientesController } from './presentation/clientes.controller.js';

@Module({
  imports: [
    ZonasModule,
    TypeOrmModule.forFeature([
      ClienteOrmEntity,
      TipoClienteOrmEntity,
      PotencialOrmEntity,
      EstadoClienteOrmEntity,
    ]),
  ],
  controllers: [ClientesController],
  providers: [
    ListarOpcionesClienteUseCase,
    RegistrarClienteUseCase,
    ObtenerClienteUseCase,
    { provide: CLIENTE_REPOSITORY, useClass: TypeOrmClienteRepository },
  ],
  exports: [ObtenerClienteUseCase],
})
export class ClientesModule {}
