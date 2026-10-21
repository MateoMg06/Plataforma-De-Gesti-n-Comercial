import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import {
  AsesorEstado,
  enumValues,
} from '../../../../common/enums/domain.enums.js';

export class CambiarEstadoAsesorDto {
  @ApiProperty({ enum: AsesorEstado, example: AsesorEstado.INACTIVO })
  @IsIn(enumValues(AsesorEstado))
  estado: AsesorEstado;
}
