import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearZonaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;
}
