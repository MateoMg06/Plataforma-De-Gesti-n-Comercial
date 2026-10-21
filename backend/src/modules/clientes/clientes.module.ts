import { ListarClientesUseCase } from './application/listar-clientes.use-case.js';
import { EditarClienteUseCase } from './application/editar-cliente.use-case.js';
import { CambiarActividadClienteUseCase } from './application/cambiar-actividad-cliente.use-case.js';
import { CrearEstadoClienteUseCase } from './application/crear-estado-cliente.use-case.js';
import { EditarEstadoClienteUseCase } from './application/editar-estado-cliente.use-case.js';
import { EliminarEstadoClienteUseCase } from './application/eliminar-estado-cliente.use-case.js';
import { ListarEstadosClienteUseCase } from './application/listar-estados-cliente.use-case.js';
import { EstadosClienteController } from './presentation/estados-cliente.controller.js';
import { ESTADO_CLIENTE_REPOSITORY } from './domain/estado-cliente.repository.js';
import { TypeOrmEstadoClienteRepository } from './infrastructure/typeorm-estado-cliente.repository.js';
import { CrearPotencialUseCase } from './application/crear-potencial.use-case.js';
import { EditarPotencialUseCase } from './application/editar-potencial.use-case.js';
import { EliminarPotencialUseCase } from './application/eliminar-potencial.use-case.js';
import { ListarPotencialesUseCase } from './application/listar-potenciales.use-case.js';
import { PotencialesController } from './presentation/potenciales.controller.js';
import { POTENCIAL_REPOSITORY } from './domain/potencial.repository.js';
import { TypeOrmPotencialRepository } from './infrastructure/typeorm-potencial.repository.js';
import { CrearTipoClienteUseCase } from './application/crear-tipo-cliente.use-case.js';
import { EditarTipoClienteUseCase } from './application/editar-tipo-cliente.use-case.js';
import { EliminarTipoClienteUseCase } from './application/eliminar-tipo-cliente.use-case.js';
import { ListarTiposClienteUseCase } from './application/listar-tipos-cliente.use-case.js';
import { TiposClienteController } from './presentation/tipos-cliente.controller.js';
import { TIPO_CLIENTE_REPOSITORY } from './domain/tipo-cliente.repository.js';
import { TypeOrmTipoClienteRepository } from './infrastructure/typeorm-tipo-cliente.repository.js';
import { ListarOpcionesClienteUseCase } from './application/listar-opciones-cliente.use-case.js';
import { CrearContactoUseCase } from './application/crear-contacto.use-case.js';
import { EditarContactoUseCase } from './application/editar-contacto.use-case.js';
import { EliminarContactoUseCase } from './application/eliminar-contacto.use-case.js';
import { ListarContactosUseCase } from './application/listar-contactos.use-case.js';
import { CONTACTO_CLIENTE_REPOSITORY } from './domain/contacto-cliente.repository.js';
import { ContactoClienteOrmEntity } from './infrastructure/contacto-cliente.orm-entity.js';
import { TypeOrmContactoClienteRepository } from './infrastructure/typeorm-contacto-cliente.repository.js';
import { ContactosClienteController } from './presentation/contactos-cliente.controller.js';
import { forwardRef, Module } from '@nestjs/common';
import { VisitasModule } from '../visitas/visitas.module.js';
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
    // HU-03: clientes necesita las visitas para saber cuáles clientes son de un asesor,
    // y visitas necesita clientes para validar el cliente. forwardRef resuelve ese ciclo.
    forwardRef(() => VisitasModule),
    TypeOrmModule.forFeature([
      ClienteOrmEntity,
      TipoClienteOrmEntity,
      PotencialOrmEntity,
      EstadoClienteOrmEntity,
      ContactoClienteOrmEntity,
    ]),
  ],
  controllers: [
    EstadosClienteController,
    PotencialesController,
    ClientesController,
    TiposClienteController,
    ContactosClienteController,
  ],
  providers: [
    ListarClientesUseCase,
    EditarClienteUseCase,
    CambiarActividadClienteUseCase,
    CrearEstadoClienteUseCase,
    EditarEstadoClienteUseCase,
    EliminarEstadoClienteUseCase,
    ListarEstadosClienteUseCase,
    {
      provide: ESTADO_CLIENTE_REPOSITORY,
      useClass: TypeOrmEstadoClienteRepository,
    },
    CrearPotencialUseCase,
    EditarPotencialUseCase,
    EliminarPotencialUseCase,
    ListarPotencialesUseCase,
    { provide: POTENCIAL_REPOSITORY, useClass: TypeOrmPotencialRepository },
    CrearTipoClienteUseCase,
    EditarTipoClienteUseCase,
    EliminarTipoClienteUseCase,
    ListarTiposClienteUseCase,
    {
      provide: TIPO_CLIENTE_REPOSITORY,
      useClass: TypeOrmTipoClienteRepository,
    },
    ListarOpcionesClienteUseCase,
    RegistrarClienteUseCase,
    ObtenerClienteUseCase,
    { provide: CLIENTE_REPOSITORY, useClass: TypeOrmClienteRepository },
    // HU-07: contactos del cliente.
    ListarContactosUseCase,
    CrearContactoUseCase,
    EditarContactoUseCase,
    EliminarContactoUseCase,
    {
      provide: CONTACTO_CLIENTE_REPOSITORY,
      useClass: TypeOrmContactoClienteRepository,
    },
  ],
  exports: [ObtenerClienteUseCase],
})
export class ClientesModule {}
