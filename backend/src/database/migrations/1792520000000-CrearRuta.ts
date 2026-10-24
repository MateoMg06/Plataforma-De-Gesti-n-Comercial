import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearRuta1792520000000 implements MigrationInterface {
  name = 'CrearRuta1792520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ruta" (
        "id_ruta" SERIAL NOT NULL,
        "nombre" character varying(100) NOT NULL,
        "id_asesor" integer NOT NULL,
        "fecha_inicio" date NOT NULL,
        "fecha_fin" date NOT NULL,
        "estado" character varying(20) NOT NULL DEFAULT 'planeada',
        CONSTRAINT "PK_ruta_id_ruta" PRIMARY KEY ("id_ruta")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ruta"`);
  }
}
