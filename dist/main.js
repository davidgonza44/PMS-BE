import cluster from 'cluster';
import os from 'os';
import { ExpressServer } from './express_server.js';
import { DatabaseUtil } from './utils/db.js';
import { DDLUtil } from './utils/ddl_util.js';
const args = process.argv.slice(2);
const init = args.includes('--init');
const numCpus = os.cpus().length;
if (cluster.isPrimary) {
    console.log(`$ Master process PID: ${process.pid}`);
    if (args.length > 0 && init) {
        (async () => {
            await DatabaseUtil.getInstance();
            await DDLUtil.addDefaultRole();
            await DDLUtil.addDefaultUser();
            process.exit();
        })();
    }
    else {
        for (let i = 0; i < numCpus; i++) {
            cluster.fork();
        }
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        console.log('Starting a new worker');
        cluster.fork();
    });
}
else {
    await DatabaseUtil.getInstance();
    const server = new ExpressServer();
    process.on('uncaughtException', (error) => {
        console.error(`Uncaught exception in worker ${process.pid}:`, error);
        server.closeServer();
        setTimeout(() => {
            cluster.fork();
            cluster.worker?.disconnect();
        }, 3000);
    });
    process.on('SIGINT', () => {
        console.log(`Worker ${process.pid} received SIGINT, shutting down gracefully...`);
        server.closeServer();
    });
    process.on('SIGTERM', () => {
        console.log(`Worker ${process.pid} received SIGTERM, shutting down gracefully...`);
        server.closeServer();
    });
}
