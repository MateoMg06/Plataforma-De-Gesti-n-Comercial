import { MigrationInterface, QueryRunner } from 'typeorm';

// HU-03 (Kevin V): agrega el rol a la tabla "user" de BetterAuth.
// Valores: administrador, lider, asesor (ver docs/modelo-datos.md).
// Los usuarios que ya existían quedan como asesor.
export class AgregarRolUsuario1792602000000 implements MigrationInterface {
  name = 'AgregarRolUsuario1792602000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" text NOT NULL DEFAULT 'asesor'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
  }
}
