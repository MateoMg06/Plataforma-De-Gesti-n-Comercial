import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrearRutaUseCase } from './application/crear-ruta.use-case.js';
import { RUTA_REPOSITORY } from './domain/ruta.repository.js';
import { RutaOrmEntity } from './infrastructure/ruta.orm-entity.js';
import { TypeOrmRutaRepository } from './infrastructure/typeorm-ruta.repository.js';
import { RutasController } from './presentation/rutas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([RutaOrmEntity])],
  controllers: [RutasController],
  providers: [
    CrearRutaUseCase,
    { provide: RUTA_REPOSITORY, useClass: TypeOrmRutaRepository },
  ],
})
export class RutasModule {}
