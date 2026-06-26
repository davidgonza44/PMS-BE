import 'dotenv/config'

import cluster from 'cluster'
import os from 'os'
import {ExpressServer} from './express_server.js'
import {DatabaseUtil} from './utils/db.js'
import {DDLUtil} from './utils/ddl_util.js'
import { CacheUtil } from "./utils/cache_util.js"
import { UsersUtil } from './utils/users_util.js'
import {NotificationUtil} from "./utils/notification_util.js"
import {QueueWorker} from "./workers/queue_worker.js"


const args = process.argv.slice(2)
const init = args.includes('--init') 
const numCpus = os.cpus().length

// #region agent log
fetch('http://127.0.0.1:7502/ingest/3abd6f94-7716-4916-be46-ca76ec5b5c71',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db0a52'},body:JSON.stringify({sessionId:'db0a52',runId:'startup-crash-1',hypothesisId:'A,D,E',location:'src/main.ts:15',message:'main module reached branch selection',data:{pid:process.pid,isPrimary:cluster.isPrimary,args,init,numCpus},timestamp:Date.now()})}).catch(()=>{});
// #endregion

if (cluster.isPrimary){
    console.log(`$ Master process PID: ${process.pid}`)
    if (args.length > 0 && init){
        (async () => {
            // #region agent log
            fetch('http://127.0.0.1:7502/ingest/3abd6f94-7716-4916-be46-ca76ec5b5c71',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db0a52'},body:JSON.stringify({sessionId:'db0a52',runId:'startup-crash-1',hypothesisId:'C',location:'src/main.ts:22',message:'init mode before database getInstance',data:{pid:process.pid},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            await DatabaseUtil.getInstance()
            await DDLUtil.addDefaultRole() // crea el rol base
            await DDLUtil.addDefaultUser()
            process.exit()
        })()
    }
    else {
        for (let i = 0; i < numCpus ; i++){
            cluster.fork() // crea un proceso hijo por cada cpu
        }
    }

    cluster.on('exit', (worker, code, signal) => { //exit evento donde un proceso hijo muere
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`)
        console.log('Starting a new worker')
        cluster.fork()
    })

    //  darle tiempo al proceso muerto para cerrar todo limpiamente
} else { 
    // los workers se encargan de levantar el servidor y atender las peticiones
    // #region agent log
    
    // #endregion
    try {
        await DatabaseUtil.getInstance() // necesito el await para para garantizar que la DB esté completamente conectada antes de que el servidor empiece a aceptar requests.  
        
    } catch (error) {
        throw error
    }
    try{
        console.log("before cache")
        await CacheUtil.initialize()
        console.log("before express")
        await UsersUtil.putAllUsersInCache()
    } catch(error){
        throw new Error(
            error instanceof Error ? `${error.message}` : `${error}`
        )
    }
    const server = new ExpressServer()
    process.on('uncaughtException', (error) => {
        console.error(`Uncaught exception in worker ${process.pid}:`, error)
        server.closeServer()
        setTimeout( () => {
            cluster.fork()
            cluster.worker?.disconnect()
        }, 3000)

        }
    )

    process.on('SIGINT', () => {
        console.log(`Worker ${process.pid} received SIGINT, shutting down gracefully...`)
        server.closeServer()
    })

    process.on('SIGTERM', () => {
        console.log(`Worker ${process.pid} received SIGTERM, shutting down gracefully...`)
        server.closeServer()
    })
}
