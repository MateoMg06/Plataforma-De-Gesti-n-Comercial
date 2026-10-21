import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesoresModule } from '../asesores/asesores.module.js';
import { ClientesModule } from '../clientes/clientes.module.js';
import { CrearRutaUseCase } from './application/crear-ruta.use-case.js';
import { AgregarClienteRutaUseCase } from './application/agregar-cliente-ruta.use-case.js';
import { ListarRutasUseCase } from './application/listar-rutas.use-case.js';
import { ReordenarClienteRutaUseCase } from './application/reordenar-cliente-ruta.use-case.js';
import { RUTA_REPOSITORY } from './domain/ruta.repository.js';
import { RutaOrmEntity } from './infrastructure/ruta.orm-entity.js';
import { RutaClienteOrmEntity } from './infrastructure/ruta-cliente.orm-entity.js';
import { TypeOrmRutaRepository } from './infrastructure/typeorm-ruta.repository.js';
import { RutasController } from './presentation/rutas.controller.js';

@Module({
  // AsesoresModule y ClientesModule exportan los casos de uso para validar
  // que el asesor y los clientes de la ruta existen.
  imports: [AsesoresModule, ClientesModule, TypeOrmModule.forFeature([RutaOrmEntity, RutaClienteOrmEntity])],
  controllers: [RutasController],
  providers: [
    CrearRutaUseCase,
    ListarRutasUseCase,
    AgregarClienteRutaUseCase,
    ReordenarClienteRutaUseCase,
    { provide: RUTA_REPOSITORY, useClass: TypeOrmRutaRepository },
  ],
})
export class RutasModule {}
