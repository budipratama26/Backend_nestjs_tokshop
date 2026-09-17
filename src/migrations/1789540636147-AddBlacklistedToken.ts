import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlacklistedToken1789540636147 implements MigrationInterface {
  name = 'AddBlacklistedToken1789540636147';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blacklisted_token" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "jti" varchar NOT NULL,
        "expiresAt" datetime NOT NULL
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blacklisted_token_jti" ON "blacklisted_token" ("jti")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_blacklisted_token_jti"`);
    await queryRunner.query(`DROP TABLE "blacklisted_token"`);
  }
}
