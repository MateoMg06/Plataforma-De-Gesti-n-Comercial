import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class ProgramarVisitaDto {
  @ApiProperty({ example: 1, description: 'Cliente existente (GET /api/clientes).' })
  @IsInt()
  @Min(1)
  idCliente: number;

  @ApiProperty({ example: 1, description: 'Asesor existente (GET /api/asesores).' })
  @IsInt()
  @Min(1)
  idAsesor: number;

  @ApiPropertyOptional({ example: 1, description: 'Ruta a la que pertenece la visita, si tiene.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  idRuta?: number;

  // Fecha y hora en formato ISO 8601, por ejemplo 2026-10-26T09:00:00
  @ApiProperty({ example: '2026-10-26T09:00:00', description: 'Fecha y hora en formato ISO 8601.' })
  @IsDateString()
  fechaProgramada: string;
}
