import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultarBitacoraUseCase } from './application/consultar-bitacora.use-case.js';
import { BITACORA_REPOSITORY } from './domain/bitacora.repository.js';
import { BitacoraInterceptor } from './infrastructure/bitacora.interceptor.js';
import { BitacoraOrmEntity } from './infrastructure/bitacora.orm-entity.js';
import { TypeOrmBitacoraRepository } from './infrastructure/typeorm-bitacora.repository.js';
import { BitacoraController } from './presentation/bitacora.controller.js';

// Módulo transversal de la bitácora (HU-25, dueño: Kevin B).
// El interceptor queda global: cualquier módulo solo tiene que poner
// @RegistrarEnBitacora('accion') sobre el método del controlador y queda
// registrado sin repetir código. GET /api/bitacora consulta los registros.
@Module({
  imports: [TypeOrmModule.forFeature([BitacoraOrmEntity])],
  controllers: [BitacoraController],
  providers: [
    BitacoraInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: BitacoraInterceptor,
    },
    ConsultarBitacoraUseCase,
    { provide: BITACORA_REPOSITORY, useClass: TypeOrmBitacoraRepository },
  ],
  exports: [BitacoraInterceptor],
})
export class BitacoraModule {}
