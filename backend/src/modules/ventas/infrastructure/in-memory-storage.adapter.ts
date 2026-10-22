import { Injectable } from '@nestjs/common';
import type { StoragePort } from '../domain/storage.port.js';

// Adaptador en memoria para desarrollo y pruebas (sin S3 real).
@Injectable()
export class InMemoryStorageAdapter implements StoragePort {
  private readonly archivos = new Map<string, { contenido: Buffer; contentType: string }>();

  async subir(clave: string, contenido: Buffer, contentType: string): Promise<string> {
    this.archivos.set(clave, { contenido, contentType });
    return clave;
  }

  async descargar(clave: string): Promise<{ contenido: Buffer; contentType: string } | null> {
    const archivo = this.archivos.get(clave);
    if (!archivo) return null;
    return { contenido: archivo.contenido, contentType: archivo.contentType };
  }
}
