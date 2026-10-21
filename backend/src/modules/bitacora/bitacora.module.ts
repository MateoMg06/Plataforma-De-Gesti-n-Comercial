import { Module } from '@nestjs/common';
import { BitacoraInterceptor } from './infrastructure/bitacora.interceptor.js';

@Module({
  providers: [BitacoraInterceptor],
})
export class BitacoraModule {}