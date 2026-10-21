import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Sin estos decoradores, el ValidationPipe (whitelist: true) descarta los campos
// y el seguimiento llega vacío al caso de uso.
export class CrearSeguimientoDto {
  @IsInt()
  id_visita: number;

  @IsDateString()
  fecha_proxima: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  actividad: string;

  @IsString()
  @MaxLength(500)
  observacion: string;
}
