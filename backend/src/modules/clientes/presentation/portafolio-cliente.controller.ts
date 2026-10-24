import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AgregarPortafolioClienteUseCase } from '../application/agregar-portafolio-cliente.use-case.js';
import { ListarPortafolioClienteUseCase } from '../application/listar-portafolio-cliente.use-case.js';
import { RetirarPortafolioClienteUseCase } from '../application/retirar-portafolio-cliente.use-case.js';
import { AgregarPortafolioClienteDto } from './dto/agregar-portafolio-cliente.dto.js';

// HU-09: portafolio de un cliente bajo /api/clientes/:idCliente/portafolio.
@ApiTags('Portafolio de cliente')
@Controller('clientes/:idCliente/portafolio')
export class PortafolioClienteController {
  constructor(
    private readonly listarPortafolio: ListarPortafolioClienteUseCase,
    private readonly agregarPortafolio: AgregarPortafolioClienteUseCase,
    private readonly retirarPortafolio: RetirarPortafolioClienteUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Portafolio del cliente, con fecha de registro' })
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  listar(@Param('idCliente', ParseIntPipe) idCliente: number) {
    return this.listarPortafolio.ejecutar(idCliente);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar una línea del portafolio al cliente' })
  @ApiNotFoundResponse({ description: 'El cliente o el portafolio no existen.' })
  @ApiConflictResponse({ description: 'El cliente ya la tiene.' })
  agregar(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Body() dto: AgregarPortafolioClienteDto,
  ) {
    return this.agregarPortafolio.ejecutar(idCliente, dto.idPortafolio);
  }

  @Delete(':idPortafolio')
  @ApiOperation({ summary: 'Retirar una línea del portafolio del cliente' })
  @ApiNotFoundResponse({ description: 'El cliente no la tiene.' })
  retirar(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Param('idPortafolio', ParseIntPipe) idPortafolio: number,
  ) {
    return this.retirarPortafolio.ejecutar(idCliente, idPortafolio);
  }
}
