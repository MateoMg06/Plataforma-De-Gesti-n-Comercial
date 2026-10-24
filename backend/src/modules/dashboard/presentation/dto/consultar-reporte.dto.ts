import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import type { FiltrosReporte } from '../../domain/reporte.js';

// HU-33/34: filtros del reporte y de la exportación. Todos opcionales y combinables.
export class ConsultarReporteDto {
  @ApiPropertyOptional({ example: '2026-10-01', description: 'Desde este día (AAAA-MM-DD).' })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'Hasta este día, incluido (AAAA-MM-DD).' })
  @IsOptional()
  @IsDateString()
  hasta?: string;

  @ApiPropertyOptional({ type: 'integer', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idAsesor?: number;

  @ApiPropertyOptional({ type: 'integer', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idZona?: number;
}

// Convierte el DTO a los filtros del dominio. "hasta" incluye todo ese día,
// así que se busca hasta el inicio del día siguiente.
export function aFiltrosReporte(dto: ConsultarReporteDto): FiltrosReporte {
  const hasta = dto.hasta ? new Date(`${dto.hasta}T00:00:00`) : undefined;
  hasta?.setDate(hasta.getDate() + 1);
  return {
    desde: dto.desde ? new Date(`${dto.desde}T00:00:00`) : undefined,
    hasta,
    idAsesor: dto.idAsesor,
    idZona: dto.idZona,
  };
}
