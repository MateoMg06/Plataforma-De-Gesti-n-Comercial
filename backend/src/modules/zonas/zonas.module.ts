import { EditarZonaUseCase } from './application/editar-zona.use-case.js';
import { EliminarZonaUseCase } from './application/eliminar-zona.use-case.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObtenerZonaUseCase } from './application/obtener-zona.use-case.js';
import { CrearZonaUseCase } from './application/crear-zona.use-case.js';
import { ListarZonasUseCase } from './application/listar-zonas.use-case.js';
import { ZONA_REPOSITORY } from './domain/zona.repository.js';
import { TypeOrmZonaRepository } from './infrastructure/typeorm-zona.repository.js';
import { ZonaOrmEntity } from './infrastructure/zona.orm-entity.js';
import { ZonasController } from './presentation/zonas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ZonaOrmEntity])],
  exports: [ObtenerZonaUseCase],
  controllers: [ZonasController],
  providers: [
    EditarZonaUseCase,
    EliminarZonaUseCase,
    CrearZonaUseCase,
    ObtenerZonaUseCase,
    ListarZonasUseCase,
    // Aquí se conecta el puerto con su adaptador. Cambiar de BD = cambiar esta línea.
    { provide: ZONA_REPOSITORY, useClass: TypeOrmZonaRepository },
  ],
})
export class ZonasModule {}
