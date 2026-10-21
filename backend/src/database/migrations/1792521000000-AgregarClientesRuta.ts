import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarClientesRuta1792521000000 implements MigrationInterface {
  name = 'AgregarClientesRuta1792521000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ruta_cliente" (
        "id_ruta_cliente" SERIAL NOT NULL,
        "id_ruta" integer NOT NULL,
        "id_cliente" integer NOT NULL,
        "orden_visita" integer NOT NULL,
        CONSTRAINT "PK_ruta_cliente_id" PRIMARY KEY ("id_ruta_cliente"),
        CONSTRAINT "UQ_ruta_cliente_ruta_cliente" UNIQUE ("id_ruta", "id_cliente"),
        CONSTRAINT "FK_ruta_cliente_ruta" FOREIGN KEY ("id_ruta") REFERENCES "ruta"("id_ruta") ON DELETE CASCADE
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ruta_cliente"`);
  }
}
