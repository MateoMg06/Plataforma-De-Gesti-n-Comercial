import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ConsultarKpisDto {
  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    description:
      'Filtra todos los KPIs por un asesor (HU-32: el asesor ve solo lo suyo).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idAsesor?: number;
}
