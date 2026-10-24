import { Inject, Injectable } from '@nestjs/common';
import type { Asesor } from '../domain/asesor.js';
import {
  ASESOR_REPOSITORY,
  type AsesorRepository,
} from '../domain/asesor.repository.js';

@Injectable()
export class ListarAsesoresUseCase {
  constructor(
    @Inject(ASESOR_REPOSITORY) private readonly asesores: AsesorRepository,
  ) {}

  ejecutar(): Promise<Asesor[]> {
    return this.asesores.listar();
  }
}
