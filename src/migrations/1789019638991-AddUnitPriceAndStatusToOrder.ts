import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUnitPriceAndStatusToOrder1789019638991 implements MigrationInterface {
    name = 'AddUnitPriceAndStatusToOrder1789019638991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_4e9f8dd16ec084bca97b3262ed"`);
        await queryRunner.query(`CREATE TABLE "temporary_order" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "totalPrice" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "productId" integer, "orderNumber" varchar NOT NULL, "unitPrice" decimal NOT NULL DEFAULT (0), "status" varchar NOT NULL DEFAULT ('PAID'), CONSTRAINT "UQ_d27eaf76d2723521e2ac78919f9" UNIQUE ("orderNumber"), CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_88991860e839c6153a7ec878d39" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order"("id", "quantity", "totalPrice", "createdAt", "userId", "productId", "orderNumber") SELECT "id", "quantity", "totalPrice", "createdAt", "userId", "productId", "orderNumber" FROM "order"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`ALTER TABLE "temporary_order" RENAME TO "order"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4e9f8dd16ec084bca97b3262ed" ON "order" ("orderNumber") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_4e9f8dd16ec084bca97b3262ed"`);
        await queryRunner.query(`ALTER TABLE "order" RENAME TO "temporary_order"`);
        await queryRunner.query(`CREATE TABLE "order" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "totalPrice" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "productId" integer, "orderNumber" varchar NOT NULL, CONSTRAINT "UQ_d27eaf76d2723521e2ac78919f9" UNIQUE ("orderNumber"), CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_88991860e839c6153a7ec878d39" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "order"("id", "quantity", "totalPrice", "createdAt", "userId", "productId", "orderNumber") SELECT "id", "quantity", "totalPrice", "createdAt", "userId", "productId", "orderNumber" FROM "temporary_order"`);
        await queryRunner.query(`DROP TABLE "temporary_order"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4e9f8dd16ec084bca97b3262ed" ON "order" ("orderNumber") `);
    }

}
