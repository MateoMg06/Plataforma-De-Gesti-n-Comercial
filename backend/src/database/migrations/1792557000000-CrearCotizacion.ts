import { MigrationInterface, QueryRunner } from 'typeorm';

// HU-27 (Daniel): crea la tabla COTIZACION y COTIZACION_DETALLE.
// Estas tablas las dueña el módulo `ventas`; nadie más las toca.
// "documento_key" se deja lista para HU-29 (S3) y siempre queda en NULL.
export class CrearCotizacion1792557000000 implements MigrationInterface {
  name = 'CrearCotizacion1792557000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cotizacion" ("id_cotizacion" SERIAL NOT NULL, "numero" integer NOT NULL, "id_cliente" integer NOT NULL, "id_asesor" integer NOT NULL, "fecha" TIMESTAMP NOT NULL, "valor" numeric NOT NULL, "estado" character varying(20) NOT NULL DEFAULT 'borrador', "documento_key" character varying(255), CONSTRAINT "UQ_cotizacion_numero" UNIQUE ("numero"), CONSTRAINT "PK_cotizacion_id_cotizacion" PRIMARY KEY ("id_cotizacion"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion" ADD CONSTRAINT "FK_cotizacion_cliente" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion" ADD CONSTRAINT "FK_cotizacion_asesor" FOREIGN KEY ("id_asesor") REFERENCES "asesor"("id_asesor") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "cotizacion_detalle" ("id_detalle" SERIAL NOT NULL, "id_cotizacion" integer NOT NULL, "producto" character varying(200) NOT NULL, "cantidad" integer NOT NULL, "precio" numeric NOT NULL, "subtotal" numeric NOT NULL, CONSTRAINT "PK_cotizacion_detalle_id_detalle" PRIMARY KEY ("id_detalle"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion_detalle" ADD CONSTRAINT "FK_cotizacion_detalle_cotizacion" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizacion"("id_cotizacion") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cotizacion_detalle" DROP CONSTRAINT "FK_cotizacion_detalle_cotizacion"`,
    );
    await queryRunner.query(`DROP TABLE "cotizacion_detalle"`);
    await queryRunner.query(
      `ALTER TABLE "cotizacion" DROP CONSTRAINT "FK_cotizacion_asesor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion" DROP CONSTRAINT "FK_cotizacion_cliente"`,
    );
    await queryRunner.query(`DROP TABLE "cotizacion"`);
  }
}
