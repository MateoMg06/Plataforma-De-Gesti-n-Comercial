import { Controller, Get, Param, ParseEnumPipe, Query, StreamableFile } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Roles } from '@thallesp/nestjs-better-auth';
import { ConsultarReporteUseCase } from '../application/consultar-reporte.use-case.js';
import {
  ExportarReporteCsvUseCase,
  TIPOS_EXPORTACION,
  type TipoExportacion,
} from '../application/exportar-reporte-csv.use-case.js';
import { aFiltrosReporte, ConsultarReporteDto } from './dto/consultar-reporte.dto.js';

// Presentación: valida los filtros con el DTO y delega en los casos de uso.
@ApiTags('Reportes')
@Controller('reportes')
@Roles(['administrador', 'lider'])
export class ReportesController {
  constructor(
    private readonly consultarReporte: ConsultarReporteUseCase,
    private readonly exportarCsv: ExportarReporteCsvUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Reporte con filtros (HU-33)',
    description: 'Visitas, cotizaciones y pedidos filtrados por fechas, asesor y zona, con totales.',
  })
  @ApiOkResponse({ description: 'Filas de cada tipo y sus totales.' })
  @ApiBadRequestResponse({ description: 'Filtro inválido o rango de fechas al revés.' })
  consultar(@Query() dto: ConsultarReporteDto) {
    return this.consultarReporte.ejecutar(aFiltrosReporte(dto));
  }

  @Get('exportar/:tipo')
  @ApiOperation({
    summary: 'Exportar a CSV (HU-34)',
    description: 'Respeta los mismos filtros del reporte. UTF-8 con BOM para que Excel muestre bien las tildes.',
  })
  @ApiParam({ name: 'tipo', enum: TIPOS_EXPORTACION })
  @ApiProduces('text/csv')
  @ApiOkResponse({ description: 'Archivo CSV.' })
  @ApiBadRequestResponse({ description: 'Tipo o filtro inválido.' })
  async exportar(
    @Param('tipo', new ParseEnumPipe(Object.fromEntries(TIPOS_EXPORTACION.map((t) => [t, t]))))
    tipo: TipoExportacion,
    @Query() dto: ConsultarReporteDto,
  ) {
    const archivo = await this.exportarCsv.ejecutar(tipo, aFiltrosReporte(dto));
    return new StreamableFile(Buffer.from(archivo.contenido, 'utf8'), {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="${archivo.nombreArchivo}"`,
    });
  }
}
