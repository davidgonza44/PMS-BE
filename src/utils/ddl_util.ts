import { RolesService } from "../components/roles/role_service.js"
import { UsersService } from "../components/users/user_service.js";
import { Roles } from '../components/roles/roles_entity.js'
import { RolesUtil } from "./roles_utils.js";
import { Users } from "../components/users/users_entity.js";
import { encryptString } from "./common.js";
import type { DeepPartial } from "typeorm";

export class DDLUtil{
    private static super_admin_role_id : string
    
    public static async addDefaultRole() : Promise<boolean>{
        const service = new RolesService()
        const rights = RolesUtil.getAllPermissionsFromRights()
        const rol : DeepPartial<Roles> = {
            name : "superAdmin",
            description : "admin with all permissions ",
            rights 
        }
        const result = await service.create(rol)
        if (result.statusCode === 409)  {
            const roles = await service.findAll({ name : 'superAdmin'}) //busca todos los registros que cumplan co este filtro
            if (roles.data && roles.data.length > 0){
                this.super_admin_role_id = roles.data[0].role_id 
                return true
            }
        } else if (result.statusCode === 201 && result.data){
            this.super_admin_role_id = result.data.role_id
            return true
        }
        return false
    }

    public static async addDefaultUser(): Promise<boolean> {
        try {
            const service = new UsersService()
            const user : DeepPartial<Users> = {
                fullname: 'Super Admin',
                username: 'pms-admin',
                email : 'admin@pms.com',
                password: await encryptString('Admin@pms1'),
                role : {role_id : this.super_admin_role_id},
    
            }

            const result = await service.create(user)

            if (result.statusCode === 201){
                return true
            } 

            return false

        } catch (error) {
            console.error(error)
            return false
        }
    }
}