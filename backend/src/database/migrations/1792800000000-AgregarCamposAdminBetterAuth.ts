import { MigrationInterface, QueryRunner } from 'typeorm';

// HU-04 (Kevin V): columnas que necesita el plugin "admin" de BetterAuth.
// - user.banned / banReason / banExpires: un usuario desactivado ("ban") no puede entrar.
// - session.impersonatedBy: la usa el plugin internamente.
// Se escribe a mano porque las tablas de BetterAuth no son entidades de TypeORM.
export class AgregarCamposAdminBetterAuth1792800000000 implements MigrationInterface {
  name = 'AgregarCamposAdminBetterAuth1792800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "banReason" text,
        ADD COLUMN IF NOT EXISTS "banExpires" timestamptz
    `);
    await queryRunner.query(`ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "impersonatedBy" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN IF EXISTS "impersonatedBy"`);
    await queryRunner.query(`
      ALTER TABLE "user"
        DROP COLUMN IF EXISTS "banExpires",
        DROP COLUMN IF EXISTS "banReason",
        DROP COLUMN IF EXISTS "banned"
    `);
  }
}
