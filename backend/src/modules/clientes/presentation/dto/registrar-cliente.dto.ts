import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class RegistrarClienteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '900123456-7',
    maxLength: 30,
    description: 'NIT único del cliente.',
  })
  @MaxLength(30)
  nit: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Comercial Ejemplo SAS', maxLength: 200 })
  @MaxLength(200)
  razonSocial: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Ejemplo', maxLength: 200 })
  @MaxLength(200)
  nombreComercial: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Calle 10 # 20-30', maxLength: 250 })
  @MaxLength(250)
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Antioquia', maxLength: 100 })
  @MaxLength(100)
  departamento: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Medellín', maxLength: 100 })
  @MaxLength(100)
  municipio: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Centro', maxLength: 100 })
  @MaxLength(100)
  barrio: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '6041234567', maxLength: 30 })
  @MaxLength(30)
  telefono: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'ventas@example.com',
    format: 'email',
    maxLength: 254,
    description: 'Correo único; se guarda en minúsculas.',
  })
  @MaxLength(254)
  email: string;

  @IsInt()
  @ApiProperty({
    example: 1,
    type: 'integer',
    minimum: 1,
    description: 'ID de una zona existente. Consultar GET /api/zonas.',
  })
  @Min(1)
  idZona: number;

  @IsInt()
  @ApiProperty({
    example: 1,
    type: 'integer',
    minimum: 1,
    description:
      'ID de un tipo existente. Consultar GET /api/clientes/opciones.',
  })
  @Min(1)
  idTipoCliente: number;

  @IsInt()
  @ApiProperty({
    example: 1,
    type: 'integer',
    minimum: 1,
    description:
      'ID de un potencial existente. Consultar GET /api/clientes/opciones.',
  })
  @Min(1)
  idPotencial: number;

  @IsInt()
  @ApiProperty({
    example: 1,
    type: 'integer',
    minimum: 1,
    description:
      'ID de un estado existente. Consultar GET /api/clientes/opciones.',
  })
  @Min(1)
  idEstadoCliente: number;

  @IsInt()
  @ApiProperty({
    example: 15,
    type: 'integer',
    minimum: 1,
    description: 'Días entre visitas.',
  })
  @Min(1)
  frecuenciaVisitaDias: number;

  @IsNumber()
  @ApiProperty({ example: 6.2442, minimum: -90, maximum: 90 })
  @IsLatitude()
  latitud: number;

  @IsNumber()
  @ApiProperty({ example: -75.5812, minimum: -180, maximum: 180 })
  @IsLongitude()
  longitud: number;
}
