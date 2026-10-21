import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Se usa para crear y para editar: los datos que se piden son los mismos.
export class CrearAsesorDto {
  @ApiProperty({ example: 'Ana Pérez', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'ana@comercial360.co', maxLength: 150 })
  @IsEmail()
  @MaxLength(150)
  correo: string;

  @ApiProperty({ example: '3001234567', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telefono: string;
}
