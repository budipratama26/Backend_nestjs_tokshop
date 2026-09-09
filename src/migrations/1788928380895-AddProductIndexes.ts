import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductIndexes1788928380895 implements MigrationInterface {
    name = 'AddProductIndexes1788928380895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_22cc43e9a74d7498546e9a63e7" ON "product" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_6b71c587b0fd3855fa23b759ca" ON "product" ("createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_6b71c587b0fd3855fa23b759ca"`);
        await queryRunner.query(`DROP INDEX "IDX_22cc43e9a74d7498546e9a63e7"`);
    }

}
