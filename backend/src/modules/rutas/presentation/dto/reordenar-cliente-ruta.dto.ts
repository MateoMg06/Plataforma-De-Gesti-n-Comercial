import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReordenarClienteRutaDto {
  @ApiProperty({ example: 1, minimum: 1, description: 'Nueva posición del cliente en la ruta' })
  @IsInt()
  @Min(1)
  orden_visita: number;
}
