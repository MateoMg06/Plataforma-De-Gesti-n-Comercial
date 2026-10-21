import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AgregarClienteRutaDto {
  @ApiProperty({ example: 101, minimum: 1, description: 'ID del cliente que se agrega a la ruta' })
  @IsInt()
  @Min(1)
  id_cliente: number;
}
