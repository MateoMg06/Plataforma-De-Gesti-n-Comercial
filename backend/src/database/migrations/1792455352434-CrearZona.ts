import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearZona1792455352434 implements MigrationInterface {
  name = 'CrearZona1792455352434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "zona" ("id_zona" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, CONSTRAINT "UQ_98d9092625727fb46bc4aa13237" UNIQUE ("nombre"), CONSTRAINT "PK_b5e8b38e8044e0e06925c92f2a2" PRIMARY KEY ("id_zona"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "zona"`);
  }
}
