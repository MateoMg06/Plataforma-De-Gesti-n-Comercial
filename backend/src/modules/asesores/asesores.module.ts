import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObtenerAsesorUseCase } from './application/obtener-asesor.use-case.js';
import { ASESOR_REPOSITORY } from './domain/asesor.repository.js';
import { AsesorOrmEntity } from './infrastructure/asesor.orm-entity.js';
import { TypeOrmAsesorRepository } from './infrastructure/typeorm-asesor.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([AsesorOrmEntity])],
  providers: [
    ObtenerAsesorUseCase,
    // Aquí se conecta el puerto con su adaptador. Cambiar de BD = cambiar esta línea.
    { provide: ASESOR_REPOSITORY, useClass: TypeOrmAsesorRepository },
  ],
  // Otros módulos (rutas, visitas, ventas) importan AsesoresModule para usar este caso de uso.
  exports: [ObtenerAsesorUseCase],
})
export class AsesoresModule {}
