import { MigrationInterface, QueryRunner } from 'typeorm';

// HU-25 (Kevin B): crea la tabla de bitácora.
// La bitácora registra quién, cuándo y qué en las acciones marcadas con
// @RegistrarEnBitacora. "usuario_id" es texto porque así es el id de "user"
// en BetterAuth.
export class CrearBitacora1792557000001 implements MigrationInterface {
  name = 'CrearBitacora1792557000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bitacora" ("id_bitacora" SERIAL NOT NULL, "usuario_id" text NOT NULL, "usuario_nombre" character varying(100) NOT NULL, "accion" character varying(50) NOT NULL, "modulo" character varying(50) NOT NULL, "fecha" TIMESTAMP NOT NULL, "detalle" character varying(255) NOT NULL, "ip" character varying(45), CONSTRAINT "PK_bitacora_id_bitacora" PRIMARY KEY ("id_bitacora"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bitacora"`);
  }
}
