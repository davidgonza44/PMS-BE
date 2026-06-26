import { Rights } from "../../utils/common.js";
import { RolesService } from "./role_service.js";
import { BaseController } from "../../utils/base_controller.js";
import { Request, Response } from "express";
import { Roles } from "./roles_entity.js";
import { DatabaseUtil } from "../../utils/db.js";
import { hasPermission}  from "../../utils/auth_util.js";



export class RoleController extends BaseController {

    public async addHandler(req: Request, res: Response): Promise<void> {
        if (!hasPermission(req.user?.rights ?? [], "add_role")){
                    res.status(403).json({
                        statusCode : 403 , status :  "error" , message : "Unauthorized"
                })
                return
        }
        const role = req.body;
        const service = new RolesService();
        const result = await service.create(role);
        res.status(result.statusCode).json(result);
        return;
    }


    public async getAllHandler(req: Request, res: Response) : Promise<void> {
        if (!hasPermission(req.user?.rights ?? [], "get_all_roles")){
                    res.status(403).json({
                        statusCode : 403 , status : "error", message : "Unauthorized"
                })
        return
        }
        const query = req.query
        const service = new RolesService()
        const result = await service.findAll(query)
        res.status(result.statusCode).json(result)
        return
    }

    public async getOneHandler(req: Request, res: Response) : Promise<void> {
        if (!hasPermission(req.user?.rights ?? [], "get_details_role")){
                    res.status(403).json({
                        statusCode : 403 , status : "error", message : "Unauthorized"
                })
        return
        }
        const id = req.params.id as string
        const service = new RolesService()
        const result = await service.findOne(id)
        res.status(result.statusCode).json(result)
    }

    public async updateHandler(req: Request, res: Response) : Promise<void> {
        if (!hasPermission(req.user?.rights ?? [], "edit_role")){
                    res.status(403).json({
                        statusCode : 403 , status : "error" , message : "Unauthorized"
                })
        return
        }
        const role = req.body
        const id = req.params.id as string
        const service = new RolesService()
        const result = await service.update(id, role)
        res.status(result.statusCode).json(result)

    }

    public async deleteHandler(req: Request, res: Response){
        if (!hasPermission(req.user?.rights ?? [], "delete_role")){
                    return res.status(403).json({
                        statusCode : 403 , status : "error" , message : "Unauthorized"
                })
        }
        const id = req.params.id as string
        const service = new RolesService()
        const result = await service.delete(id)
        res.status(result.statusCode).json(result)

    }
}

