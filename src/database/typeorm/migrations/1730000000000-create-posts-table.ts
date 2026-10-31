import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostsTable1730000000000 implements MigrationInterface {
    name = 'CreatePostsTable1730000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "posts" (
                "id" SERIAL PRIMARY KEY,
                "title" varchar NOT NULL,
                "category" varchar NOT NULL,
                "description" text NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "deleted_at" TIMESTAMP WITH TIME ZONE
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS posts;`);
    }

}
