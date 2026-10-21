import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { enumValues, PedidoEstado } from '../../../../common/enums/domain.enums.js';

// HU-31: filtros de la consulta de pedidos. Todos son opcionales y combinables.
export class ConsultarPedidosDto {
  @ApiPropertyOptional({ type: 'integer', minimum: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCliente?: number;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    description: 'El asesor de la cotización de origen. Con rol asesor se ignora: siempre ve los suyos.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idAsesor?: number;

  @ApiPropertyOptional({ enum: PedidoEstado })
  @IsOptional()
  @IsIn(enumValues(PedidoEstado))
  estado?: PedidoEstado;

  // Fechas en formato AAAA-MM-DD.
  @ApiPropertyOptional({ example: '2026-10-01', description: 'Desde este día (AAAA-MM-DD).' })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'Hasta este día, incluido (AAAA-MM-DD).' })
  @IsOptional()
  @IsDateString()
  hasta?: string;
}
