import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// HU-13: nueva fecha y motivo de la reprogramación.
export class ReprogramarVisitaDto {
  @ApiProperty({ example: '2026-10-28T10:00:00', description: 'Nueva fecha y hora (ISO 8601).' })
  @IsDateString()
  fechaProgramada: string;

  @ApiProperty({ example: 'El cliente pidió cambiar la cita por inventario.', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  motivo: string;
}
