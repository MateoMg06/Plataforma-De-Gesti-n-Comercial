import { ApiProperty } from '@nestjs/swagger';
import { RegistrarClienteDto } from './registrar-cliente.dto.js';

export class RespuestaClienteDto extends RegistrarClienteDto {
  @ApiProperty({ example: 1, type: 'integer', readOnly: true })
  id: number;

  @ApiProperty({
    example: '2026-10-20T14:00:00.000Z',
    format: 'date-time',
    readOnly: true,
    description: 'Fecha de creación asignada automáticamente.',
  })
  fechaCreacion: string;

  @ApiProperty({
    example: true,
    readOnly: true,
    description:
      'Indica si el cliente está activo. Se registra activo por defecto.',
  })
  activo: boolean;
}

export class OpcionClienteDto {
  @ApiProperty({ example: 1, type: 'integer' })
  id: number;

  @ApiProperty({ example: 'Minorista' })
  nombre: string;
}

export class OpcionPotencialDto extends OpcionClienteDto {
  @ApiProperty({
    example: 1,
    type: 'integer',
    description: 'Orden de presentación del potencial.',
  })
  orden: number;
}

export class OpcionesClienteDto {
  @ApiProperty({
    type: [OpcionClienteDto],
    example: [{ id: 1, nombre: 'Minorista' }],
  })
  tipos: OpcionClienteDto[];

  @ApiProperty({
    type: [OpcionPotencialDto],
    example: [{ id: 1, nombre: 'Alto', orden: 1 }],
  })
  potenciales: OpcionPotencialDto[];

  @ApiProperty({
    type: [OpcionClienteDto],
    example: [{ id: 1, nombre: 'Prospecto' }],
  })
  estados: OpcionClienteDto[];
}

export class PaginaClientesDto {
  @ApiProperty({ type: [RespuestaClienteDto] })
  datos: RespuestaClienteDto[];

  @ApiProperty({ example: 25, type: 'integer' })
  total: number;

  @ApiProperty({ example: 1, type: 'integer' })
  page: number;

  @ApiProperty({ example: 10, type: 'integer' })
  limit: number;
}
