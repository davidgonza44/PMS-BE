import express from 'express';
import dotenv from 'dotenv';
import { Routes } from './routes/index.js';
dotenv.config();
if (!process.env.DB_HOST) {
    throw new Error('DB_HOST no esta definido en .env');
}
if (!process.env.DB_PORT) {
    throw new Error('DB_PORT no esta definido en .env');
}
if (!process.env.DB_USERNAME) {
    throw new Error('DB_USERNAME no esta definido en .env');
}
if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD no esta definido en .env');
}
if (!process.env.DB_NAME) {
    throw new Error('DB_NAME no esta definido en .env');
}
if (!process.env.PORT)
    throw new Error('PORT no está definido en .env');
export class ExpressServer {
    static server = null;
    server_config = {
        port: Number(process.env.DB_PORT),
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dbname: process.env.DB_NAME
    };
    constructor() {
        const port = Number(process.env.PORT);
        const app = express();
        app.use(express.json());
        app.get("/ping", (req, res) => {
            res.send("pong");
        });
        const routes = new Routes(app);
        if (routes) {
            console.log('Routes initialized successfully');
        }
        ExpressServer.server = app.listen(port, () => {
            console.log(`Server is running on port ${port} with  pid = ${process.pid}`);
        });
        process.on('SIGINT', () => {
            this.closeServer();
        });
        process.on('SIGTERM', () => {
            this.closeServer();
        });
    }
    closeServer() {
        ExpressServer.server?.close(() => {
            console.log('server closed');
            process.exit(0);
        });
    }
}
