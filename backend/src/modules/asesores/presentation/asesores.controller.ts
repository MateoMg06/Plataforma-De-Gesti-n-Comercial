import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ActualizarAsesorUseCase } from '../application/actualizar-asesor.use-case.js';
import { CambiarEstadoAsesorUseCase } from '../application/cambiar-estado-asesor.use-case.js';
import { ListarAsesoresUseCase } from '../application/listar-asesores.use-case.js';
import { ObtenerAsesorUseCase } from '../application/obtener-asesor.use-case.js';
import { RegistrarAsesorUseCase } from '../application/registrar-asesor.use-case.js';
import { CambiarEstadoAsesorDto } from './dto/cambiar-estado-asesor.dto.js';
import { CrearAsesorDto } from './dto/crear-asesor.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en los casos de uso.
// Sin lógica de negocio aquí.
// Cuando HU-03 esté lista, agregar @Roles('administrador').
@ApiTags('Asesores')
@Controller('asesores')
export class AsesoresController {
  constructor(
    private readonly registrarAsesor: RegistrarAsesorUseCase,
    private readonly listarAsesores: ListarAsesoresUseCase,
    private readonly obtenerAsesor: ObtenerAsesorUseCase,
    private readonly actualizarAsesor: ActualizarAsesorUseCase,
    private readonly cambiarEstadoAsesor: CambiarEstadoAsesorUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar asesores' })
  listar() {
    return this.listarAsesores.ejecutar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un asesor' })
  @ApiNotFoundResponse({ description: 'El asesor no existe.' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerAsesor.ejecutar(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un asesor (queda activo)' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiConflictResponse({ description: 'El correo ya existe.' })
  crear(@Body() dto: CrearAsesorDto) {
    return this.registrarAsesor.ejecutar(dto.nombre, dto.correo, dto.telefono);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar nombre, correo y teléfono' })
  @ApiNotFoundResponse({ description: 'El asesor no existe.' })
  @ApiConflictResponse({ description: 'El correo ya es de otro asesor.' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearAsesorDto,
  ) {
    return this.actualizarAsesor.ejecutar(
      id,
      dto.nombre,
      dto.correo,
      dto.telefono,
    );
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Activar o inactivar un asesor' })
  @ApiNotFoundResponse({ description: 'El asesor no existe.' })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoAsesorDto,
  ) {
    return this.cambiarEstadoAsesor.ejecutar(id, dto.estado);
  }
}
