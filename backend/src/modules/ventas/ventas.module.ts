import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module.js';
import { AsesoresModule } from '../asesores/asesores.module.js';
import { BitacoraModule } from '../bitacora/bitacora.module.js';
import { CotizacionOrmEntity } from './infrastructure/cotizacion.orm-entity.js';
import { CotizacionDetalleOrmEntity } from './infrastructure/cotizacion-detalle.orm-entity.js';
import { PedidoOrmEntity } from './infrastructure/pedido.orm-entity.js';
import { TypeOrmCotizacionRepository } from './infrastructure/typeorm-cotizacion.repository.js';
import { TypeOrmPedidoRepository } from './infrastructure/typeorm-pedido.repository.js';
import { InMemoryStorageAdapter } from './infrastructure/in-memory-storage.adapter.js';
import { S3StorageAdapter } from './infrastructure/s3-storage.adapter.js';
import { COTIZACION_REPOSITORY } from './domain/cotizacion.repository.js';
import { PEDIDO_REPOSITORY } from './domain/pedido.repository.js';
import { STORAGE_PORT } from './domain/storage.port.js';
import { CrearCotizacionUseCase } from './application/crear-cotizacion.use-case.js';
import { ListarCotizacionesUseCase } from './application/listar-cotizaciones.use-case.js';
import { EnviarCotizacionUseCase } from './application/enviar-cotizacion.use-case.js';
import { AprobarCotizacionUseCase } from './application/aprobar-cotizacion.use-case.js';
import { RechazarCotizacionUseCase } from './application/rechazar-cotizacion.use-case.js';
import { ConvertirCotizacionEnPedidoUseCase } from './application/convertir-cotizacion-en-pedido.use-case.js';
import { SubirDocumentoCotizacionUseCase } from './application/subir-documento-cotizacion.use-case.js';
import { DescargarDocumentoCotizacionUseCase } from './application/descargar-documento-cotizacion.use-case.js';
import { ListarPedidosUseCase } from './application/listar-pedidos.use-case.js';
import { ObtenerPedidoUseCase } from './application/obtener-pedido.use-case.js';
import { CotizacionesController } from './presentation/cotizaciones.controller.js';
import { PedidosController } from './presentation/pedidos.controller.js';

@Module({
  imports: [
    ClientesModule,
    AsesoresModule,
    // La bitácora es transversal: el interceptor global registra las
    // acciones que el controlador marca con @RegistrarEnBitacora.
    BitacoraModule,
    TypeOrmModule.forFeature([CotizacionOrmEntity, CotizacionDetalleOrmEntity, PedidoOrmEntity]),
  ],
  controllers: [CotizacionesController, PedidosController],
  providers: [
    CrearCotizacionUseCase,
    ListarCotizacionesUseCase,
    EnviarCotizacionUseCase,
    AprobarCotizacionUseCase,
    RechazarCotizacionUseCase,
    ConvertirCotizacionEnPedidoUseCase,
    SubirDocumentoCotizacionUseCase,
    DescargarDocumentoCotizacionUseCase,
    ListarPedidosUseCase,
    ObtenerPedidoUseCase,
    { provide: COTIZACION_REPOSITORY, useClass: TypeOrmCotizacionRepository },
    { provide: PEDIDO_REPOSITORY, useClass: TypeOrmPedidoRepository },
    // HU-29: con S3_BUCKET en el .env (AWS) se usa S3; sin él (desarrollo), memoria.
    // useFactory se evalúa al arrancar, cuando el .env ya está cargado.
    {
      provide: STORAGE_PORT,
      useFactory: () =>
        process.env.S3_BUCKET ? new S3StorageAdapter() : new InMemoryStorageAdapter(),
    },
  ],
  // HU-32: el dashboard lee cotizaciones y pedidos con estos casos de uso.
  exports: [ListarCotizacionesUseCase, ListarPedidosUseCase],
})
export class VentasModule {}
