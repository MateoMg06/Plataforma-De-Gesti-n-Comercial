import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AgregarPortafolioClienteDto {
  @ApiProperty({ example: 1, description: 'ID de un portafolio existente (GET /api/portafolios).' })
  @IsInt()
  @Min(1)
  idPortafolio: number;
}
