import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrearZonaUseCase } from './application/crear-zona.use-case.js';
import { ListarZonasUseCase } from './application/listar-zonas.use-case.js';
import { ZONA_REPOSITORY } from './domain/zona.repository.js';
import { TypeOrmZonaRepository } from './infrastructure/typeorm-zona.repository.js';
import { ZonaOrmEntity } from './infrastructure/zona.orm-entity.js';
import { ZonasController } from './presentation/zonas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ZonaOrmEntity])],
  controllers: [ZonasController],
  providers: [
    CrearZonaUseCase,
    ListarZonasUseCase,
    // Aquí se conecta el puerto con su adaptador. Cambiar de BD = cambiar esta línea.
    { provide: ZONA_REPOSITORY, useClass: TypeOrmZonaRepository },
  ],
})
export class ZonasModule {}
