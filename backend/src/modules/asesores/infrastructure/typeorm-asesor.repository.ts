import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AsesorEstado } from '../../../common/enums/domain.enums.js';
import { Asesor } from '../domain/asesor.js';
import type { AsesorRepository } from '../domain/asesor.repository.js';
import { AsesorOrmEntity } from './asesor.orm-entity.js';

// Adaptador: implementa el puerto del dominio usando TypeORM + PostgreSQL.
@Injectable()
export class TypeOrmAsesorRepository implements AsesorRepository {
  constructor(
    @InjectRepository(AsesorOrmEntity)
    private readonly repo: Repository<AsesorOrmEntity>,
  ) {}

  async guardar(asesor: Asesor): Promise<Asesor> {
    const fila = await this.repo.save({
      id: asesor.id ?? undefined,
      nombre: asesor.nombre,
      correo: asesor.correo,
      telefono: asesor.telefono,
      estado: asesor.estado,
    });
    return this.aDominio(fila);
  }

  async listar(): Promise<Asesor[]> {
    const filas = await this.repo.find({ order: { nombre: 'ASC' } });
    return filas.map((f) => this.aDominio(f));
  }

  async buscarPorId(id: number): Promise<Asesor | null> {
    const fila = await this.repo.findOne({ where: { id } });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorCorreo(correo: string): Promise<Asesor | null> {
    const fila = await this.repo.findOne({ where: { correo } });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorIdUsuario(idUsuario: string): Promise<Asesor | null> {
    const fila = await this.repo.findOne({ where: { idUsuario } });
    return fila ? this.aDominio(fila) : null;
  }

  private aDominio(fila: AsesorOrmEntity): Asesor {
    return new Asesor(
      fila.id,
      fila.nombre,
      fila.correo,
      fila.telefono,
      fila.estado as AsesorEstado,
    );
  }
}
