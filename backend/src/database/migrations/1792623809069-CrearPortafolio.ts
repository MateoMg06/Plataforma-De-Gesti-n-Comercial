import { MigrationInterface, QueryRunner } from "typeorm";

// HU-09 (Francisco): crea PORTAFOLIO y CLIENTE_PORTAFOLIO (N:M con fecha de registro).
// El SQL generado traía cambios a tablas ajenas (borraba 6 llaves foráneas y
// cambiaba cotizacion); se quitaron a mano, como pide CONTRIBUTING.md.
export class CrearPortafolio1792623809069 implements MigrationInterface {
    name = 'CrearPortafolio1792623809069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "portafolio" ("id_portafolio" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "descripcion" character varying(255) NOT NULL DEFAULT '', CONSTRAINT "UQ_933eaa43fa151c1903b5d8d37c0" UNIQUE ("nombre"), CONSTRAINT "PK_aedbe9c9e81f7f51c2c9126530a" PRIMARY KEY ("id_portafolio"))`);
        await queryRunner.query(`CREATE TABLE "cliente_portafolio" ("id_cliente" integer NOT NULL, "id_portafolio" integer NOT NULL, "fecha_registro" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c72d10fd018d3bd001d70878952" PRIMARY KEY ("id_cliente", "id_portafolio"))`);
        await queryRunner.query(`ALTER TABLE "cliente_portafolio" ADD CONSTRAINT "FK_443af8534f0eacccab5d3bc1485" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cliente_portafolio" ADD CONSTRAINT "FK_2eb7102f9ad25a41b28452b7607" FOREIGN KEY ("id_portafolio") REFERENCES "portafolio"("id_portafolio") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cliente_portafolio" DROP CONSTRAINT "FK_2eb7102f9ad25a41b28452b7607"`);
        await queryRunner.query(`ALTER TABLE "cliente_portafolio" DROP CONSTRAINT "FK_443af8534f0eacccab5d3bc1485"`);
        await queryRunner.query(`DROP TABLE "cliente_portafolio"`);
        await queryRunner.query(`DROP TABLE "portafolio"`);
    }

}
