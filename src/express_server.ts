import express, {Application} from 'express';
import {Server} from "http"
import { Routes } from './routes/index.js';


// #region agent log
fetch('http://127.0.0.1:7502/ingest/3abd6f94-7716-4916-be46-ca76ec5b5c71',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db0a52'},body:JSON.stringify({sessionId:'db0a52',runId:'startup-crash-1',hypothesisId:'B,E',location:'src/express_server.ts:8',message:'express_server module evaluating env guards',data:{hasDbHost:Boolean(process.env.DB_HOST),hasDbPort:Boolean(process.env.DB_PORT),hasDbUsername:Boolean(process.env.DB_USERNAME),hasDbPassword:Boolean(process.env.DB_PASSWORD),hasDbName:Boolean(process.env.DB_NAME),hasPort:Boolean(process.env.PORT)},timestamp:Date.now()})}).catch(()=>{});
// #endregion

if (!process.env.DB_HOST) {throw new Error('DB_HOST no esta definido en .env')}
if (!process.env.DB_PORT) {throw new Error('DB_PORT no esta definido en .env')}
if (!process.env.DB_USERNAME) {throw new Error('DB_USERNAME no esta definido en .env')}
if (!process.env.DB_PASSWORD) {throw new Error('DB_PASSWORD no esta definido en .env')}
if (!process.env.DB_NAME) {throw new Error('DB_NAME no esta definido en .env')}
if (!process.env.PORT) throw new Error('PORT no está definido en .env');

const app : Application = express()
app.use(express.json())

app.get("/ping", (req, res) => {
    res.send("pong")
})

const routes = new Routes(app)
if (routes){
    console.log('Routes initialized successfully')
}

export class ExpressServer{
    private static server : Server | null = null


    constructor(){
        const port = Number(process.env.PORT)

        ExpressServer.server  = app.listen(port, () => {
            console.log(`Server is running on port ${port} with  pid = ${process.pid}`)
        })

        process.on('SIGINT', () => {
            this.closeServer()
        })

        process.on('SIGTERM', () => {
            this.closeServer()
        })
    }

    public closeServer(): void {
        ExpressServer.server?.close(() => {
            console.log('server closed')
            process.exit(0)
        })
    }

    
}

export {app}