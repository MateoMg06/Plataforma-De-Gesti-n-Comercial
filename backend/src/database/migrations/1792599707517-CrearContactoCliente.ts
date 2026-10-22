import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearContactoCliente1792599707517 implements MigrationInterface {
    name = 'CrearContactoCliente1792599707517'

    // HU-07 (Francisco): crea la tabla contacto_cliente con su llave a cliente.
    // TypeORM también generaba cambios en tablas ajenas (ruta_cliente, cotizacion,
    // visita_resultado): se quitaron a mano.
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contacto_cliente" ("id_contacto" SERIAL NOT NULL, "id_cliente" integer NOT NULL, "nombre" character varying(150) NOT NULL, "cargo" character varying(100) NOT NULL, "telefono" character varying(30) NOT NULL, "celular" character varying(30) NOT NULL, "email" character varying(254) NOT NULL, "es_principal" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_ca547781229b0c378379f0ca94f" PRIMARY KEY ("id_contacto"))`);
        await queryRunner.query(`ALTER TABLE "contacto_cliente" ADD CONSTRAINT "FK_e967a9292c171d64e951a7270ac" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacto_cliente" DROP CONSTRAINT "FK_e967a9292c171d64e951a7270ac"`);
        await queryRunner.query(`DROP TABLE "contacto_cliente"`);
    }

}
