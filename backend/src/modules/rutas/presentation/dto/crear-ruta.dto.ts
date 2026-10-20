import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CrearRutaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsInt()
  @Min(1)
  id_asesor: number;

  @IsDateString({ strict: true })
  fecha_inicio: string;

  @IsDateString({ strict: true })
  fecha_fin: string;
}
