import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearSeguimiento1792592469453 implements MigrationInterface {
    name = 'CrearSeguimiento1792592469453'

    // HU-23 (Kevin B): crea la tabla seguimiento. La tabla bitacora la crea CrearBitacora.
    // TypeORM también generaba DROP de llaves foráneas de ruta_cliente y
    // visita_resultado (tablas ajenas): se quitaron a mano.
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "seguimiento" ("id_seguimiento" SERIAL NOT NULL, "id_visita" integer NOT NULL, "fecha_proxima" date NOT NULL, "actividad" character varying NOT NULL, "observacion" character varying NOT NULL, "completado" boolean NOT NULL DEFAULT false, "fecha_completado" TIMESTAMP WITH TIME ZONE, "completado_por" character varying, CONSTRAINT "PK_7a288f4305d48c36527dae2d5d0" PRIMARY KEY ("id_seguimiento"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "seguimiento"`);
    }

}
