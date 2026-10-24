import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResultadoVisita1792522800000 implements MigrationInterface {
  name = 'ResultadoVisita1792522800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // HU-19: fecha en que se realizó realmente la visita.
    await queryRunner.query(`ALTER TABLE "visita" ADD "fecha_real" TIMESTAMP`);
    // Catálogo de resultados.
    await queryRunner.query(
      `CREATE TABLE "resultado_visita" ("id_resultado" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, CONSTRAINT "UQ_resultado_visita_nombre" UNIQUE ("nombre"), CONSTRAINT "PK_resultado_visita_id_resultado" PRIMARY KEY ("id_resultado"))`,
    );
    // Varios resultados por visita, cada uno con su observación.
    await queryRunner.query(
      `CREATE TABLE "visita_resultado" ("id_visita_resultado" SERIAL NOT NULL, "id_visita" integer NOT NULL, "id_resultado" integer NOT NULL, "observacion" character varying(500) NOT NULL, CONSTRAINT "PK_visita_resultado_id" PRIMARY KEY ("id_visita_resultado"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita_resultado" ADD CONSTRAINT "FK_visita_resultado_visita" FOREIGN KEY ("id_visita") REFERENCES "visita"("id_visita") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita_resultado" ADD CONSTRAINT "FK_visita_resultado_resultado" FOREIGN KEY ("id_resultado") REFERENCES "resultado_visita"("id_resultado") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    // Semilla del catálogo para la demo.
    await queryRunner.query(
      `INSERT INTO "resultado_visita" ("nombre") VALUES ('Visita comercial'), ('Cobro'), ('Entrega de documentos'), ('Demostración de producto'), ('Firma de contrato')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "resultado_visita"`);
    await queryRunner.query(`ALTER TABLE "visita_resultado" DROP CONSTRAINT "FK_visita_resultado_resultado"`);
    await queryRunner.query(`ALTER TABLE "visita_resultado" DROP CONSTRAINT "FK_visita_resultado_visita"`);
    await queryRunner.query(`DROP TABLE "visita_resultado"`);
    await queryRunner.query(`DROP TABLE "resultado_visita"`);
    await queryRunner.query(`ALTER TABLE "visita" DROP COLUMN "fecha_real"`);
  }
}
