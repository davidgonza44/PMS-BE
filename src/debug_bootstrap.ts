import { inspect } from 'node:util'

const serializeError = (error: unknown) => {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 6).join('\n')
        }
    }

    return {
        type: typeof error,
        keys: error && typeof error === 'object' ? Object.getOwnPropertyNames(error) : [],
        inspected: inspect(error, { depth: 4 })
    }
}

// #region agent log
fetch('http://127.0.0.1:7502/ingest/3abd6f94-7716-4916-be46-ca76ec5b5c71',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db0a52'},body:JSON.stringify({sessionId:'db0a52',runId:'startup-crash-1',hypothesisId:'A,B,E',location:'src/debug_bootstrap.ts:18',message:'debug bootstrap started',data:{nodeVersion:process.version,argv:process.argv.slice(2),hasDbHost:Boolean(process.env.DB_HOST),hasDbPort:Boolean(process.env.DB_PORT),hasDbUsername:Boolean(process.env.DB_USERNAME),hasDbPassword:Boolean(process.env.DB_PASSWORD),hasDbName:Boolean(process.env.DB_NAME),hasPort:Boolean(process.env.PORT)},timestamp:Date.now()})}).catch(()=>{});
// #endregion

try {
    await import('./main.js')
    // #region agent log
    fetch('http://127.0.0.1:7502/ingest/3abd6f94-7716-4916-be46-ca76ec5b5c71',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db0a52'},body:JSON.stringify({sessionId:'db0a52',runId:'startup-crash-1',hypothesisId:'A,B,E',location:'src/debug_bootstrap.ts:24',message:'main import resolved',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
} catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7502/ingest/3abd6f94-7716-4916-be46-ca76ec5b5c71',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db0a52'},body:JSON.stringify({sessionId:'db0a52',runId:'startup-crash-1',hypothesisId:'A,B,E',location:'src/debug_bootstrap.ts:29',message:'main import failed',data:{error:serializeError(error)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error('Debug bootstrap caught startup error:', error)
    process.exitCode = 1
}
