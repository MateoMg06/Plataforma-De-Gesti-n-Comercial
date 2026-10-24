import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearVisita1792515600000 implements MigrationInterface {
  name = 'CrearVisita1792515600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "visita" ("id_visita" SERIAL NOT NULL, "id_cliente" integer NOT NULL, "id_asesor" integer NOT NULL, "id_ruta" integer, "fecha_programada" TIMESTAMP NOT NULL, "estado_visita" character varying(20) NOT NULL, CONSTRAINT "PK_visita_id_visita" PRIMARY KEY ("id_visita"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "visita"`);
  }
}
