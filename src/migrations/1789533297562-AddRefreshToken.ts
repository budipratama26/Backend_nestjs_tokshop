import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshToken1789533297562 implements MigrationInterface {
  name = 'AddRefreshToken1789533297562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_token" (
        "id" varchar PRIMARY KEY NOT NULL,
        "tokenHash" varchar NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT (0),
        "replacedByTokenId" varchar,
        "expiresAt" datetime NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "userId" integer,
        CONSTRAINT "FK_refresh_token_user" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_token_tokenHash" ON "refresh_token" ("tokenHash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_token_userId" ON "refresh_token" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_refresh_token_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_refresh_token_tokenHash"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
  }
}
