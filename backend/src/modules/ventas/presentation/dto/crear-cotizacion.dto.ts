import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DetalleCotizacionDto {
  @ApiProperty({ example: 'Equipo de soldadura' })
  @IsString()
  @IsNotEmpty()
  producto: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 4500000, minimum: 1, description: 'Precio unitario. El subtotal y el total los calcula el backend.' })
  @IsNumber()
  @Min(1)
  precio: number;
}

export class CrearCotizacionDto {
  @ApiProperty({ example: 1, description: 'Cliente existente (GET /api/clientes).' })
  @IsInt()
  @Min(1)
  idCliente: number;

  @ApiProperty({ example: 1, description: 'Asesor existente (GET /api/asesores).' })
  @IsInt()
  @Min(1)
  idAsesor: number;

  @ApiProperty({ type: [DetalleCotizacionDto], description: 'Productos de la cotización.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCotizacionDto)
  detalles: DetalleCotizacionDto[];
}
