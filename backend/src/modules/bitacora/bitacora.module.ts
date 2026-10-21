import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BitacoraInterceptor } from './infrastructure/bitacora.interceptor.js';

// APP_INTERCEPTOR activa el interceptor para TODOS los endpoints.
// Solo registra los métodos marcados con @RegistrarEnBitacora.
@Module({
  providers: [{ provide: APP_INTERCEPTOR, useClass: BitacoraInterceptor }],
})
export class BitacoraModule {}
