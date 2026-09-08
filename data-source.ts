import 'reflect-metadata';
import { DataSource } from 'typeorm';

export default new DataSource({
    type: 'better-sqlite3',
    database: 'database.sqlite',
    entities: ['dist/**/*.entity.js'],
    migrations: ['src/migrations/*.ts'],
});