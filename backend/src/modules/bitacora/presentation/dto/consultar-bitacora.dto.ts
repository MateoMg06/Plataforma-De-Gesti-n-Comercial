import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { ACCIONES_BITACORA } from '../../infrastructure/bitacora.decorator.js';

// HU-25: filtros de la consulta de la bitácora. Todos son opcionales y combinables.
export class ConsultarBitacoraDto {
  @ApiPropertyOptional({ description: 'Id del usuario (BetterAuth) que hizo la acción.' })
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @ApiPropertyOptional({ enum: ACCIONES_BITACORA, description: 'Tipo de acción.' })
  @IsOptional()
  @IsIn(ACCIONES_BITACORA)
  accion?: string;

  @ApiPropertyOptional({ example: '2026-10-01', description: 'Desde este día (AAAA-MM-DD).' })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'Hasta este día, incluido (AAAA-MM-DD).' })
  @IsOptional()
  @IsDateString()
  hasta?: string;
}
