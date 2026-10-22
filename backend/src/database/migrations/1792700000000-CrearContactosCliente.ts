import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearContactosCliente1792700000000 implements MigrationInterface {
  name = 'CrearContactosCliente1792700000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "contacto_cliente" (
      "id_contacto_cliente" SERIAL NOT NULL,
      "id_cliente" integer NOT NULL,
      "nombre" character varying(200) NOT NULL,
      "cargo" character varying(100) NOT NULL,
      "telefono" character varying(30) NOT NULL,
      "celular" character varying(30) NOT NULL,
      "email" character varying(254) NOT NULL,
      "principal" boolean NOT NULL DEFAULT false,
      CONSTRAINT "PK_contacto_cliente" PRIMARY KEY ("id_contacto_cliente"),
      CONSTRAINT "FK_contacto_cliente_cliente" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT
    )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_contacto_principal_cliente" ON "contacto_cliente" ("id_cliente") WHERE "principal" = true`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "contacto_cliente"');
  }
}
