import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Sirve para crear y para editar un contacto (HU-07).
export class GuardarContactoDto {
  @ApiProperty({ example: 'Ana Pérez', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @ApiProperty({ example: 'Jefe de compras', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  cargo: string;

  @ApiProperty({ example: '6044441010', maxLength: 30 })
  @IsString()
  @MaxLength(30)
  telefono: string;

  @ApiProperty({ example: '3001234567', maxLength: 30 })
  @IsString()
  @MaxLength(30)
  celular: string;

  @ApiProperty({ example: 'ana@empresa.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
