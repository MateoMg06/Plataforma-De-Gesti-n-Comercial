import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import type { StoragePort } from '../domain/storage.port.js';

@Injectable()
export class S3StorageAdapter implements StoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? process.env.AWS_S3_BUCKET ?? '';
    this.client = new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  async subir(clave: string, contenido: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: clave,
        Body: contenido,
        ContentType: contentType,
      }),
    );
    return clave;
  }

  async descargar(clave: string): Promise<{ contenido: Buffer; contentType: string } | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: clave }),
      );
      const stream = res.Body as NodeJS.ReadableStream;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return {
        contenido: Buffer.concat(chunks),
        contentType: res.ContentType ?? 'application/octet-stream',
      };
    } catch {
      return null;
    }
  }
}
