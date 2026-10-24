import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';
import {
  CLIENTE_REPOSITORY,
  type ClienteRepository,
  type ConsultaClientes,
  type PaginaClientes,
} from '../domain/cliente.repository.js';

@Injectable()
export class ListarClientesUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository,
    // HU-03: caso de uso exportado por visitas. forwardRef porque visitas
    // también usa clientes (dependencia en los dos sentidos).
    @Inject(forwardRef(() => ListarVisitasUseCase))
    private readonly listarVisitas: ListarVisitasUseCase,
  ) {}

  async ejecutar(
    consulta: ConsultaClientes,
    usuario?: { id: string; role?: string | null },
  ): Promise<PaginaClientes> {
    if (
      !Number.isInteger(consulta.page) ||
      consulta.page < 1 ||
      !Number.isInteger(consulta.limit) ||
      consulta.limit < 1 ||
      consulta.limit > 100
    ) {
      throw new BadRequestException(
        'page debe ser positivo y limit debe estar entre 1 y 100',
      );
    }
    const filtro = { ...consulta, busqueda: consulta.busqueda?.trim() };

    // HU-03: el asesor solo ve los clientes que tienen visitas con él.
    // Administrador y líder (o sin usuario) ven todos.
    if (usuario?.role === 'asesor') {
      const visitas = await this.listarVisitas.ejecutar(usuario);
      const ids = [...new Set(visitas.map((v) => v.idCliente))];
      if (ids.length === 0) {
        return {
          datos: [],
          total: 0,
          page: consulta.page,
          limit: consulta.limit,
        };
      }
      filtro.ids = ids;
    }
    return this.clientes.listar(filtro);
  }
}
