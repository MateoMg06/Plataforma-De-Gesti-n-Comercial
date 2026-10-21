import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearSeguimientoYBitacora1792592469453 implements MigrationInterface {
    name = 'CrearSeguimientoYBitacora1792592469453'

    // Solo crea las tablas de Kevin B. TypeORM también generaba DROP de llaves
    // foráneas de ruta_cliente y visita_resultado (tablas ajenas): se quitaron a mano.
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bitacora" ("id_bitacora" SERIAL NOT NULL, "usuario_id" character varying(100) NOT NULL, "usuario_nombre" character varying(100) NOT NULL, "accion" character varying(50) NOT NULL, "modulo" character varying(50) NOT NULL, "fecha" TIMESTAMP NOT NULL, "detalle" character varying(255) NOT NULL, "ip" character varying(45), CONSTRAINT "PK_b1cd973071fbe3705f5c2dba556" PRIMARY KEY ("id_bitacora"))`);
        await queryRunner.query(`CREATE TABLE "seguimiento" ("id_seguimiento" SERIAL NOT NULL, "id_visita" integer NOT NULL, "fecha_proxima" date NOT NULL, "actividad" character varying NOT NULL, "observacion" character varying NOT NULL, "completado" boolean NOT NULL DEFAULT false, "fecha_completado" TIMESTAMP WITH TIME ZONE, "completado_por" character varying, CONSTRAINT "PK_7a288f4305d48c36527dae2d5d0" PRIMARY KEY ("id_seguimiento"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "seguimiento"`);
        await queryRunner.query(`DROP TABLE "bitacora"`);
    }

}
