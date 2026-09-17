import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoginLockoutToUser1789549960952 implements MigrationInterface {
  name = 'AddLoginLockoutToUser1789549960952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "failedLoginAttempts" integer NOT NULL DEFAULT (0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lockedUntil" datetime`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lockedUntil"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "failedLoginAttempts"`);
  }
}