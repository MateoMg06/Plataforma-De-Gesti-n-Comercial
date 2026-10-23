import { MigrationInterface, QueryRunner } from "typeorm";

// HU-13: agrega motivo_reprogramacion a VISITA (tabla de Santiago, campo previsto
// en docs/modelo-datos.md para la reprogramación de Mateo).
// El SQL generado traía cambios a tablas ajenas (6 llaves foráneas y cotizacion);
// se quitaron a mano, como pide CONTRIBUTING.md.
export class AgregarMotivoReprogramacion1792765198877 implements MigrationInterface {
    name = 'AgregarMotivoReprogramacion1792765198877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visita" ADD "motivo_reprogramacion" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visita" DROP COLUMN "motivo_reprogramacion"`);
    }

}
