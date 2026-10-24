import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearRutaDto {
  @ApiProperty({ example: 'Ruta norte', maxLength: 100, description: 'Nombre de la ruta comercial' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 1, minimum: 1, description: 'ID del asesor asignado' })
  @IsInt()
  @Min(1)
  id_asesor: number;

  @ApiProperty({ example: '2026-10-20', format: 'date' })
  @IsDateString({ strict: true })
  fecha_inicio: string;

  @ApiProperty({ example: '2026-10-22', format: 'date' })
  @IsDateString({ strict: true })
  fecha_fin: string;
}
