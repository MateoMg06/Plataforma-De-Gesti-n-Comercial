import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarFechaPedido1792596889245 implements MigrationInterface {
    name = 'AgregarFechaPedido1792596889245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pedido" ADD "fecha" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pedido" DROP COLUMN "fecha"`);
    }

}
