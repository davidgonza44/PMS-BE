import { Repository } from "typeorm";
import { BaseService } from "../../utils/base_service.js";
import { DatabaseUtil } from "../../utils/db.js";
import { Roles } from "./roles_entity.js";



export class RolesService extends BaseService<Roles> {
    constructor(){
        const db = new DatabaseUtil()
        const repository = db.getRepository(Roles)
        super(repository)
    }
    
}

