import { DataSource } from 'typeorm';

export default new DataSource({
    type: 'better-sqlite3',
    database: 'database.sqlite',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
});