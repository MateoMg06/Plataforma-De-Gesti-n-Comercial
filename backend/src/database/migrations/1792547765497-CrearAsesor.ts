import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearAsesor1792547765497 implements MigrationInterface {
  name = 'CrearAsesor1792547765497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "asesor" ("id_asesor" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "correo" character varying(150) NOT NULL, "telefono" character varying(20) NOT NULL, "estado" character varying(10) NOT NULL DEFAULT 'activo', "id_usuario" text, CONSTRAINT "UQ_e3db8a64df62e932a9a1f400aee" UNIQUE ("correo"), CONSTRAINT "PK_6ed9b30cdc516de7c40e1ac16b5" PRIMARY KEY ("id_asesor"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "asesor"`);
  }
}
