import { ProjectsService } from './projects_service.js';
import { Request, Response } from 'express';
import { Projects } from './projects_entity.js'
import { hasPermission } from '../../utils/auth_util.js';
import { UsersUtil } from '../../utils/users_util.js';
import { BaseController } from '../../utils/base_controller.js';

export class ProjectController extends BaseController{
    public async addHandler(req: Request, res: Response){
        if (!hasPermission(req?.user?.rights ?? [], "add_project")){
            return res.status(403).json({statusCode: 403, status: "error", message: "Forbidden"})
        }
        
        try{
            const service = new ProjectsService()
            const {name, description, user_ids, start_time, end_time} = req.body

            const validUserIds : boolean = await UsersUtil.checkValidUserIds(user_ids)
            if (!validUserIds){
                return res.status(400).json({statusCode: 400, status: "error", message: "One or more user_ids are invalid"})
            }

            const new_project  = {
                name,
                description,
                user_ids,
                start_time, 
                end_time
            }
            
            const result = await service.create(new_project)
            if (result.status === "error"){
                res.status(result.statusCode).json(result)
                return
            }
            res.status(201).json({
                statusCode: 201,
                status: "success",
                data: result.data,
                message: "Project created successfully"
            })

        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message)
            } else {
                console.error(error)
            }
            return res.status(500).json({statusCode: 500, status: "error", message: "Internal Server Error"})
        }}

        
        public async getAllHandler(req: Request, res: Response){
            if (!hasPermission(req?.user?.rights ?? [], "get_all_projects")){
                return res.status(403).json({
                    statusCode : 403,
                    status: "error",
                    message: "forbidden"
                })
            }
            
            try{
                const service = new ProjectsService()
                const result = await service.findAll(req.query)
                if (result.status === "error" || !result.data){
                    res.status(result.statusCode).json(result)
                    return
                }

                
                const projects = await Promise.all(result.data.map(async(project) => {
                    const {user_ids, ...project_without_id} = project    
                    return {
                        ...project_without_id,
                        users : await UsersUtil.getUserBasicInfo(user_ids)
                    }
                }))

                res.status(200).json({
                    statusCode : 200,
                    status: "success",
                    data: projects,
                    message: "Projects retrieved successfully"
                })

            } catch(error){
                if (error instanceof Error) {
                    console.error(error.message)
                } else {
                    console.error(error)
                }
                return res.status(500).json({statusCode: 500, status: "error", message: "Internal Server Error"})
            }
        }

    public async getOneHandler(req: Request<{id: string}>, res: Response){
        if (!hasPermission(req?.user?.rights ?? [], "get_project_details")){
            return res.status(403).json({
                statusCode : 403,
                status: "error",
                message: "forbidden"
            })
        }
        const service = new ProjectsService()
        const {id} = req.params
        const result = await service.findOne(id)
        if (result.status === "error" || !result.data){
            res.status(result.statusCode).json(result)
            return
        }
        const {user_ids, ...project_without_id} = result.data
        project_without_id['users'] = await UsersUtil.getUserBasicInfo(result.data?.user_ids ?? [])
        res.status(result.statusCode).json(project_without_id)

    }

    public async updateHandler(req: Request<{id: string}>, res: Response){
        if (!hasPermission(req?.user?.rights ?? [], "edit_project")){
            return res.status(403).json({
                statusCode : 403,
                status: "error",
                message: "forbidden"
            })
        }
        try{
            const service = new ProjectsService()
            const project = req.body
            const result = await service.update(req.params.id, project)
            res.status(result.statusCode).json(result)

        } catch(error){
            console.error(error)
            return res.status(500).json({statusCode: 500, status: "error", message: "Internal Server Error"})
        }
    }

    public async deleteHandler(req: Request<{id: string}>, res: Response){
        if (!hasPermission(req?.user?.rights ?? [], "delete_project")){
            return res.status(403).json({
                statusCode : 403,
                status: "error",
                message: "forbidden"
            })
        }
        try{
            const service = new ProjectsService()
            const result = await service.delete(req.params.id)
            res.status(result.statusCode).json(result)
        } catch(error){
            console.error(error)
            return res.status(500).json({
                statusCode: 500,
                status: "error",
                message: "Internal Server Error"
            })
        }

    }

}