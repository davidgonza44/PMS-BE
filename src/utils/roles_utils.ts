import { Rights } from "./common.js";
import { RolesService } from "../components/roles/role_service.js";
import { Roles } from "../components/roles/roles_entity.js";


export class RolesUtil {
    public static getAllPermissionsFromRights() : string[] {
        let permissions : string[] = []
        for (const module in Rights){
            if (Rights[module]['ALL']){
                let sectionValues = Rights[module]['ALL']
                sectionValues = sectionValues.split(',')
                permissions = [...permissions, ...sectionValues]
            }
        }
        return permissions
    }
    // obtener y juntar los permisos de varios roles
    public static async getAllRightsFromRoles(role_ids : string[] ) : Promise<string[]>{
        const service = new RolesService() //contrata al expertor en roles
        const roles : Roles[] = (await service.findByIds(role_ids)).data ?? [] // toma la lista de roles que viene en data
        let rights : string[] = []
        for (const rol of roles){
            const rightsFromRole = rol.rights.map(right => right.trim())
            rights = [...new Set([...rights, ...rightsFromRole])] //une el cont los permisos anteriores con los permisos del rol actual
        } // quita las repetido y guarda la lista actualizada
        return rights
    }
}