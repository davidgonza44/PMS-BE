import { UsersService } from "../components/users/user_service.js"
import { CacheUtil } from "./cache_util.js"
export class UsersUtil{
    public static async getUserFromUsername(username: string){
        try{
            if (username){
                const service = new UsersService()
                const users = await service.customQuery(
                    "entity.username = :username", //busca la columna username de la tabla sea igual a un valor q t paso aparte
                    { username }
                )
                if (users && users.length > 0){
                    return users[0]
                }
                
            }
        } catch(error){
            console.error(`error while getUser from token : ${error}`)
        }

        return null
    }

    public static async checkValidUserIds(ids: string[]) : Promise<boolean> {
        const service = new UsersService()
        const users = await service.findByIds(ids)
        return users.data ? users.data.length === ids.length : false
    }

    public static async putAllUsersInCache(){
        const service = new UsersService()
        const result = await service.findAll({})
        if (result.status === "success" && result.data){
            const users = result.data
            for (const user of users){
                CacheUtil.set("User", user.user_id, user)
            }
        } else{
            console.log('Error while putting users in cache: ', result.message)
        }
    }

    public static async getUserBasicInfo(user_ids : string[]){
        try{
            const service = new UsersService()
            const users : { user_id: string; username: string }[] = []
            for (const id of user_ids){
                const user  = (await service.findOne(id)).data
                if (!user){
                    continue
                }
                users.push({
                        user_id : user.user_id,
                        username : user.username,
                    })
            }
            return users
        } catch(error){
            console.error(`error while getting user basic info : ${error}`)
            return []
        }
    }
}
