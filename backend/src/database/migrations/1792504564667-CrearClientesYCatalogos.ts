import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearClientesYCatalogos1792504564667 implements MigrationInterface {
  name = 'CrearClientesYCatalogos1792504564667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tipo_cliente" ("id_tipo_cliente" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, CONSTRAINT "UQ_2e15ebf78706e4b2f7547e1d312" UNIQUE ("nombre"), CONSTRAINT "PK_021b080acace64fdd81fa3bd27c" PRIMARY KEY ("id_tipo_cliente"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "potencial" ("id_potencial" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "orden" integer NOT NULL, CONSTRAINT "UQ_e471047982d0ab6fcb74e85e26f" UNIQUE ("nombre"), CONSTRAINT "PK_7bc4adf4410323b36ccbafac745" PRIMARY KEY ("id_potencial"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "estado_cliente" ("id_estado_cliente" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, CONSTRAINT "UQ_1af67fbe5624a8b38f2a200b102" UNIQUE ("nombre"), CONSTRAINT "PK_a79c785c0d93b5e6f0c1338fda0" PRIMARY KEY ("id_estado_cliente"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cliente" ("id_cliente" SERIAL NOT NULL, "nit" character varying(30) NOT NULL, "razon_social" character varying(200) NOT NULL, "nombre_comercial" character varying(200) NOT NULL, "direccion" character varying(250) NOT NULL, "departamento" character varying(100) NOT NULL, "municipio" character varying(100) NOT NULL, "barrio" character varying(100) NOT NULL, "telefono" character varying(30) NOT NULL, "email" character varying(254) NOT NULL, "id_zona" integer NOT NULL, "id_tipo_cliente" integer NOT NULL, "id_potencial" integer NOT NULL, "id_estado_cliente" integer NOT NULL, "frecuencia_visita_dias" integer NOT NULL, "latitud" double precision NOT NULL, "longitud" double precision NOT NULL, "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "activo" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_3a722445847d37bb66f41e1c168" UNIQUE ("nit"), CONSTRAINT "UQ_503f81286c5e49acd6a832abf43" UNIQUE ("email"), CONSTRAINT "PK_dbf4725e2849f4036253ee7dbd0" PRIMARY KEY ("id_cliente"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD CONSTRAINT "FK_89def68913fed4aaa582c3aeea2" FOREIGN KEY ("id_zona") REFERENCES "zona"("id_zona") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD CONSTRAINT "FK_a22bfd4e0c0bf10004a83a66547" FOREIGN KEY ("id_tipo_cliente") REFERENCES "tipo_cliente"("id_tipo_cliente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD CONSTRAINT "FK_d3a8ca659c54866ecb76ef5b0e8" FOREIGN KEY ("id_potencial") REFERENCES "potencial"("id_potencial") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD CONSTRAINT "FK_315b6f01dbaacfc460c1fbc38d5" FOREIGN KEY ("id_estado_cliente") REFERENCES "estado_cliente"("id_estado_cliente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cliente" DROP CONSTRAINT "FK_315b6f01dbaacfc460c1fbc38d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" DROP CONSTRAINT "FK_d3a8ca659c54866ecb76ef5b0e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" DROP CONSTRAINT "FK_a22bfd4e0c0bf10004a83a66547"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" DROP CONSTRAINT "FK_89def68913fed4aaa582c3aeea2"`,
    );
    await queryRunner.query(`DROP TABLE "cliente"`);
    await queryRunner.query(`DROP TABLE "estado_cliente"`);
    await queryRunner.query(`DROP TABLE "potencial"`);
    await queryRunner.query(`DROP TABLE "tipo_cliente"`);
  }
}
