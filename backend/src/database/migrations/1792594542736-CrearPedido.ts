import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearPedido1792594542736 implements MigrationInterface {
    name = 'CrearPedido1792594542736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ruta_cliente" DROP CONSTRAINT "FK_ruta_cliente_ruta"`);
        await queryRunner.query(`ALTER TABLE "cotizacion" DROP CONSTRAINT "FK_cotizacion_cliente"`);
        await queryRunner.query(`ALTER TABLE "cotizacion" DROP CONSTRAINT "FK_cotizacion_asesor"`);
        await queryRunner.query(`ALTER TABLE "cotizacion_detalle" DROP CONSTRAINT "FK_cotizacion_detalle_cotizacion"`);
        await queryRunner.query(`ALTER TABLE "visita_resultado" DROP CONSTRAINT "FK_visita_resultado_visita"`);
        await queryRunner.query(`ALTER TABLE "visita_resultado" DROP CONSTRAINT "FK_visita_resultado_resultado"`);
        await queryRunner.query(`CREATE TABLE "seguimiento" ("id_seguimiento" SERIAL NOT NULL, "id_visita" integer NOT NULL, "fecha_proxima" character varying NOT NULL, "actividad" character varying NOT NULL, "observacion" character varying NOT NULL, "completado" boolean NOT NULL DEFAULT false, "fecha_completado" TIMESTAMP WITH TIME ZONE, "completado_por" character varying, CONSTRAINT "PK_7a288f4305d48c36527dae2d5d0" PRIMARY KEY ("id_seguimiento"))`);
        await queryRunner.query(`CREATE TABLE "pedido" ("id_pedido" SERIAL NOT NULL, "numero" integer NOT NULL, "id_cotizacion" integer NOT NULL, "id_cliente" integer NOT NULL, "valor" numeric NOT NULL, "estado" character varying(20) NOT NULL, CONSTRAINT "UQ_398f504766b1bc33d11b9df30ab" UNIQUE ("numero"), CONSTRAINT "PK_72dab98a1e27f9a1fabc394f64b" PRIMARY KEY ("id_pedido"))`);
        await queryRunner.query(`ALTER TABLE "cotizacion" ALTER COLUMN "estado" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cotizacion" ALTER COLUMN "estado" SET DEFAULT 'borrador'`);
        await queryRunner.query(`DROP TABLE "pedido"`);
        await queryRunner.query(`DROP TABLE "seguimiento"`);
        await queryRunner.query(`ALTER TABLE "visita_resultado" ADD CONSTRAINT "FK_visita_resultado_resultado" FOREIGN KEY ("id_resultado") REFERENCES "resultado_visita"("id_resultado") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visita_resultado" ADD CONSTRAINT "FK_visita_resultado_visita" FOREIGN KEY ("id_visita") REFERENCES "visita"("id_visita") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cotizacion_detalle" ADD CONSTRAINT "FK_cotizacion_detalle_cotizacion" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizacion"("id_cotizacion") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cotizacion" ADD CONSTRAINT "FK_cotizacion_asesor" FOREIGN KEY ("id_asesor") REFERENCES "asesor"("id_asesor") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cotizacion" ADD CONSTRAINT "FK_cotizacion_cliente" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ruta_cliente" ADD CONSTRAINT "FK_ruta_cliente_ruta" FOREIGN KEY ("id_ruta") REFERENCES "ruta"("id_ruta") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
