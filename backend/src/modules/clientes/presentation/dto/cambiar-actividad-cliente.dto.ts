import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CambiarActividadClienteDto {
  @ApiProperty({
    example: false,
    description: 'true para activar, false para desactivar.',
  })
  @IsBoolean()
  activo: boolean;
}
