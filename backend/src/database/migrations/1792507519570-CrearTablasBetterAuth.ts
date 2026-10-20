import { MigrationInterface, QueryRunner } from 'typeorm';

// HU-01 (Kevin V): crea las tablas que BetterAuth necesita para usuarios y
// sesiones. El SQL es EXACTAMENTE el que genera el CLI oficial de BetterAuth
// (`npx auth generate`), para que el esquema coincida con lo que la librería
// espera. Estas tablas las dueña el módulo `auth`; nadie más las toca.
export class CrearTablasBetterAuth1792507519570 implements MigrationInterface {
  name = 'CrearTablasBetterAuth1792507519570';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" text NOT NULL PRIMARY KEY, "name" text NOT NULL, "email" text NOT NULL, "emailVerified" boolean NOT NULL, "image" text, "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "UQ_user_email" UNIQUE ("email"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" text NOT NULL PRIMARY KEY, "expiresAt" timestamptz NOT NULL, "token" text NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" timestamptz NOT NULL, "ipAddress" text, "userAgent" text, "userId" text NOT NULL, CONSTRAINT "UQ_session_token" UNIQUE ("token"), CONSTRAINT "FK_session_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `CREATE TABLE "account" ("id" text NOT NULL PRIMARY KEY, "accountId" text NOT NULL, "providerId" text NOT NULL, "userId" text NOT NULL, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" timestamptz NOT NULL, CONSTRAINT "FK_account_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `CREATE TABLE "verification" ("id" text NOT NULL PRIMARY KEY, "identifier" text NOT NULL, "value" text NOT NULL, "expiresAt" timestamptz NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_session_userId" ON "session" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_account_userId" ON "account" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_verification_identifier" ON "verification" ("identifier")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // En orden inverso: primero lo que depende de "user".
    await queryRunner.query(`DROP INDEX "public"."IDX_verification_identifier"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_account_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_session_userId"`);
    await queryRunner.query(`DROP TABLE "verification"`);
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
