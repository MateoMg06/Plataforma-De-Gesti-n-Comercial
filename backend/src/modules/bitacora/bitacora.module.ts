import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitacoraInterceptor } from './infrastructure/bitacora.interceptor.js';
import { BitacoraOrmEntity } from './infrastructure/bitacora.orm-entity.js';

// Módulo transversal de la bitácora (HU-25, dueño: Kevin B).
// El interceptor queda global: cualquier módulo solo tiene que poner
// @RegistrarEnBitacora('accion') sobre el método del controlador y queda
// registrado sin repetir código.
@Module({
  imports: [TypeOrmModule.forFeature([BitacoraOrmEntity])],
  providers: [
    BitacoraInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: BitacoraInterceptor,
    },
  ],
  exports: [BitacoraInterceptor],
})
export class BitacoraModule {}
