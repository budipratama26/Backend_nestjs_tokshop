import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditLog1789549960953 implements MigrationInterface {
  name = 'AddAuditLog1789549960953';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_log" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "action" varchar NOT NULL,
        "userId" integer,
        "targetId" varchar,
        "targetType" varchar,
        "ipAddress" varchar,
        "details" text,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now'))
      )`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_action" ON "audit_log" ("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_userId" ON "audit_log" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_createdAt" ON "audit_log" ("createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_audit_log_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_log_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_log_action"`);
    await queryRunner.query(`DROP TABLE "audit_log"`);
  }
}