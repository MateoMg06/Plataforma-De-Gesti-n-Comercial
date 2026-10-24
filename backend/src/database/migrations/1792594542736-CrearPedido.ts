import { MigrationInterface, QueryRunner } from "typeorm";

// HU-30 (Daniel): crea solo la tabla pedido.
// El SQL generado traía cambios a tablas ajenas (borraba 6 llaves foráneas y
// volvía a crear seguimiento); se quitaron a mano, como pide CONTRIBUTING.md.
export class CrearPedido1792594542736 implements MigrationInterface {
    name = 'CrearPedido1792594542736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pedido" ("id_pedido" SERIAL NOT NULL, "numero" integer NOT NULL, "id_cotizacion" integer NOT NULL, "id_cliente" integer NOT NULL, "valor" numeric NOT NULL, "estado" character varying(20) NOT NULL, CONSTRAINT "UQ_398f504766b1bc33d11b9df30ab" UNIQUE ("numero"), CONSTRAINT "PK_72dab98a1e27f9a1fabc394f64b" PRIMARY KEY ("id_pedido"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pedido"`);
    }

}
