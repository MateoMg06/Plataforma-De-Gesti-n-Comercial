import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

// Un resultado del catálogo con su observación (HU-19).
export class ResultadoItemDto {
  @ApiProperty({ example: 1, description: 'Resultado del catálogo (GET /api/resultados-visita).' })
  @IsInt()
  @Min(1)
  idResultado: number;

  @ApiProperty({ example: 'Interesado; pide cotización.', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  observacion: string;
}

export class RegistrarResultadoDto {
  // Fecha y hora real en formato ISO 8601, por ejemplo 2026-10-26T11:30:00
  @ApiProperty({ example: '2026-10-26T11:30:00', description: 'Fecha y hora real de la visita (ISO 8601).' })
  @IsDateString()
  fechaReal: string;

  @ApiProperty({ enum: ['realizada', 'cancelada', 'no_atendida'], example: 'realizada' })
  @IsIn(['realizada', 'cancelada', 'no_atendida'])
  estado: 'realizada' | 'cancelada' | 'no_atendida';

  @ApiProperty({ type: [ResultadoItemDto], maxItems: 20, description: 'Puede ir vacío.' })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ResultadoItemDto)
  resultados: ResultadoItemDto[];
}
