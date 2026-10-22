import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarColumnasAdminBetterAuth1761150000000
  implements MigrationInterface
{
  name = 'AgregarColumnasAdminBetterAuth1761150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS "banReason" text,
        ADD COLUMN IF NOT EXISTS "banExpires" timestamp,
        ADD COLUMN IF NOT EXISTS "activo" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "session"
        ADD COLUMN IF NOT EXISTS "impersonatedBy" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "session" DROP COLUMN IF EXISTS "impersonatedBy"
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
        DROP COLUMN IF EXISTS "activo",
        DROP COLUMN IF EXISTS "banExpires",
        DROP COLUMN IF EXISTS "banReason",
        DROP COLUMN IF EXISTS "banned"
    `);
  }
}