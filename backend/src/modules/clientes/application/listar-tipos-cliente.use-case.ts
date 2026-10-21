import { Inject, Injectable } from '@nestjs/common';
import {
  TIPO_CLIENTE_REPOSITORY,
  type TipoClienteRepository,
} from '../domain/tipo-cliente.repository.js';

@Injectable()
export class ListarTiposClienteUseCase {
  constructor(
    @Inject(TIPO_CLIENTE_REPOSITORY)
    private readonly opciones: TipoClienteRepository,
  ) {}

  ejecutar() {
    return this.opciones.listar();
  }
}
