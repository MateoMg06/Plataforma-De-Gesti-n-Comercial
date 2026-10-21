import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class ProgramarVisitaDto {
  @IsInt()
  @Min(1)
  idCliente: number;

  @IsInt()
  @Min(1)
  idAsesor: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  idRuta?: number;

  // Fecha y hora en formato ISO 8601, por ejemplo 2026-10-26T09:00:00
  @IsDateString()
  fechaProgramada: string;
}
