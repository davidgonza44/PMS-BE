import { BaseService } from "../../utils/base_service.js";
import { Users } from "./users_entity.js";
import { DatabaseUtil } from "../../utils/db.js";
export class UsersService extends BaseService {
    constructor() {
        const repository = new DatabaseUtil().getRepository(Users);
        super(repository);
    }
    async findByEmailWithPassword(email) {
        return await this.repository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();
    }
}
