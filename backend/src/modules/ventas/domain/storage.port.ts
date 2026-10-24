// Puerto de almacenamiento: el dominio define QUÉ necesita; la infraestructura decide CÓMO.
// Para HU-29 (documento en S3). Mientras no haya S3, se usa un adaptador en memoria.
export interface StoragePort {
  subir(clave: string, contenido: Buffer, contentType: string): Promise<string>;
  descargar(clave: string): Promise<{ contenido: Buffer; contentType: string } | null>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
