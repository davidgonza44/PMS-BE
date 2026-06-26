import { DataSource } from 'typeorm';
import { Projects } from '../components/projects/projects_entity.js';
import { Tasks } from '../components/tasks/tasks_entity.js';
import { Users } from '../components/users/users_entity.js';
import { Comments } from '../components/comments/comments_entity.js';
import { Roles } from '../components/roles/roles_entity.js';
export class DatabaseUtil {
    static connection = null;
    static instance;
    repositories = {};
    constructor() {
        this.connectDatabase();
    }
    async connectDatabase() {
        if (DatabaseUtil.connection?.isInitialized) {
            return DatabaseUtil.connection;
        }
        try {
            const AppDataSource = new DataSource({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                entities: [Projects, Tasks, Users, Comments, Roles],
                poolSize: 10,
                synchronize: true,
                logging: false
            });
            await AppDataSource.initialize();
            DatabaseUtil.connection = AppDataSource;
            console.log('connected to the database');
            return DatabaseUtil.connection;
        }
        catch (error) {
            console.error('Error connecting to the database', error);
            throw error;
        }
    }
    static async getInstance() {
        if (!DatabaseUtil.instance) {
            DatabaseUtil.instance = new DatabaseUtil();
            await DatabaseUtil.instance.connectDatabase();
        }
        return DatabaseUtil.instance;
    }
    getRepository(entity) {
        if (!DatabaseUtil.connection) {
            throw new Error("Database not connected");
        }
        const entityName = entity.name;
        if (!this.repositories[entityName]) {
            this.repositories[entityName] = DatabaseUtil.connection.getRepository(entity);
        }
        return this.repositories[entityName];
    }
}
