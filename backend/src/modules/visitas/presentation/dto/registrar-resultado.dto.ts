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
  @IsInt()
  @Min(1)
  idResultado: number;

  @IsString()
  @MaxLength(500)
  observacion: string;
}

export class RegistrarResultadoDto {
  // Fecha y hora real en formato ISO 8601, por ejemplo 2026-10-26T11:30:00
  @IsDateString()
  fechaReal: string;

  @IsIn(['realizada', 'cancelada', 'no_atendida'])
  estado: 'realizada' | 'cancelada' | 'no_atendida';

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ResultadoItemDto)
  resultados: ResultadoItemDto[];
}
