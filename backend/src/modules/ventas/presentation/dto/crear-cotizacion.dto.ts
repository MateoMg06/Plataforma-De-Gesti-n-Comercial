import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DetalleCotizacionDto {
  @IsString()
  @IsNotEmpty()
  producto: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @Min(1)
  precio: number;
}

export class CrearCotizacionDto {
  @IsInt()
  @Min(1)
  idCliente: number;

  @IsInt()
  @Min(1)
  idAsesor: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCotizacionDto)
  detalles: DetalleCotizacionDto[];
}
