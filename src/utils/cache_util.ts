import * as redis from "redis"

if (!process.env.REDIS_URL){
    throw new Error("Redis url is not defined")
}

export class CacheUtil{
    private static client = redis.createClient({
        url : process.env.REDIS_URL
    })

    static async initialize(){
        CacheUtil.client.on("error", (err) => {
            console.error(`error initializing: ${err}`)
        })
        await CacheUtil.client.connect()
    }

    public static async get(cachename : string, key : string){
        try{
            const data = await CacheUtil.client.get(`${cachename}:${key}`)
            return data ? JSON.parse(data) : null
        } catch(err){
            console.log(`error gettting cache: ${err}`)
            return null
        }
    }

    public static async set(cachename : string, key : string, value){
        try{
            await CacheUtil.client.set(`${cachename}:${key}`, JSON.stringify(value) )
        } catch(error){
            console.error(`error setting cache: ${error}`)
        }
    }

    public static async remove(cachename : string, key : string){
        try{
            await CacheUtil.client.del(`${cachename}:${key}`)
        } catch(error){
            console.error(`error deleting cache: ${error}`)
        }
    }

    public static async closeConnection(){
        if (CacheUtil.client.isOpen){
            await CacheUtil.client.quit()
        }
    }
}