import { BaseService } from "../../utils/base_service.js";
import { Users } from "./users_entity.js";
import { DatabaseUtil } from "../../utils/db.js";

export class UsersService extends BaseService<Users>{
    constructor(){
        const repository = new DatabaseUtil().getRepository(Users)
        super(repository)
    }

    public async findByEmailWithPassword(email : string) : Promise<Users | null> {
        return await this.repository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", {email})
            .getOne();
    }

    public async findByIdWithPassword(id : string) : Promise<Users | null>{
        return await this.repository
        .createQueryBuilder("user")
        .addSelect("user.password")
        .where("user.user_id = :id", {id})
        .getOne()
    }
}