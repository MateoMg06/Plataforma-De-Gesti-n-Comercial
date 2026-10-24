import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Sin estos decoradores, el ValidationPipe (whitelist: true) descarta los campos
// y el seguimiento llega vacío al caso de uso.
export class CrearSeguimientoDto {
  @ApiProperty({ example: 1, description: 'Visita de la que nace el seguimiento.' })
  @IsInt()
  id_visita: number;

  @ApiProperty({ example: '2026-10-28', description: 'Fecha de la próxima acción (AAAA-MM-DD).' })
  @IsDateString()
  fecha_proxima: string;

  @ApiProperty({ example: 'Llamar al cliente', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  actividad: string;

  @ApiProperty({ example: 'Pidió cotización formal de la nueva línea.', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  observacion: string;
}
