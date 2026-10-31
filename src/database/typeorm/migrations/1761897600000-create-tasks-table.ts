import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1761897600000 implements MigrationInterface {
    name = 'CreateTasksTable1761897600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "title" varchar(255) NOT NULL,
                "category" varchar(255) NOT NULL,
                "description" text,
                "is_completed" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS tasks;`);
    }

}
