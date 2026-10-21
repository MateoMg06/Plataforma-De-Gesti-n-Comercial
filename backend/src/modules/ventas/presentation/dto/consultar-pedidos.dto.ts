import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { enumValues, PedidoEstado } from '../../../../common/enums/domain.enums.js';

// HU-31: filtros de la consulta de pedidos. Todos son opcionales y combinables.
export class ConsultarPedidosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCliente?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idAsesor?: number;

  @IsOptional()
  @IsIn(enumValues(PedidoEstado))
  estado?: PedidoEstado;

  // Fechas en formato AAAA-MM-DD.
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
