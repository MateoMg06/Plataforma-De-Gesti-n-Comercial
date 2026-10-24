import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActualizarAsesorUseCase } from './application/actualizar-asesor.use-case.js';
import { CambiarEstadoAsesorUseCase } from './application/cambiar-estado-asesor.use-case.js';
import { ListarAsesoresUseCase } from './application/listar-asesores.use-case.js';
import { ObtenerAsesorUseCase } from './application/obtener-asesor.use-case.js';
import { ObtenerAsesorPorUsuarioUseCase } from './application/obtener-asesor-por-usuario.use-case.js';
import { RegistrarAsesorUseCase } from './application/registrar-asesor.use-case.js';
import { ASESOR_REPOSITORY } from './domain/asesor.repository.js';
import { AsesorOrmEntity } from './infrastructure/asesor.orm-entity.js';
import { TypeOrmAsesorRepository } from './infrastructure/typeorm-asesor.repository.js';
import { AsesoresController } from './presentation/asesores.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([AsesorOrmEntity])],
  controllers: [AsesoresController],
  providers: [
    RegistrarAsesorUseCase,
    ListarAsesoresUseCase,
    ObtenerAsesorUseCase,
    ObtenerAsesorPorUsuarioUseCase,
    ActualizarAsesorUseCase,
    CambiarEstadoAsesorUseCase,
    // Aquí se conecta el puerto con su adaptador. Cambiar de BD = cambiar esta línea.
    { provide: ASESOR_REPOSITORY, useClass: TypeOrmAsesorRepository },
  ],
  // Otros módulos (rutas, visitas, ventas, agenda) importan AsesoresModule para usar estos casos de uso.
  exports: [ObtenerAsesorUseCase, ObtenerAsesorPorUsuarioUseCase],
})
export class AsesoresModule {}
