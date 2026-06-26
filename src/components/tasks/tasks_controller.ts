import { hasPermission } from "../../utils/auth_util.js";
import { TasksService } from "./task_service.js";
import { Request, Response } from "express";
import  {ProjectsService} from '../projects/projects_service.js'
import { UsersService } from "../users/user_service.js";
import { DeepPartial } from "typeorm";
import { BaseController } from "../../utils/base_controller.js";
import { UsersUtil } from "../../utils/users_util.js"
import { NotificationUtil } from "../../utils/notification_util.js";

export class TaskController extends BaseController {
    public async addHandler(req : Request, res: Response){
        if (!hasPermission(req?.user?.rights ?? [], "add_task")){
            res.status(403).json({
                statusCode : 403,
                status: "error",
                message: "forbidden"
            })
            return
        }
        try {
            const service = new TasksService()
            const { 
                name, 
                description, 
                project_id, 
                user_id, 
                priority, 
                status, 
                estimated_start_time, 
                estimated_end_time
            } = req.body

            const projectService = new ProjectsService()
            const project = await projectService.findOne(project_id)
            if (project.status === "error" || !project.data){
                return res.status(400).json({
                    statusCode : 400,
                    status: "error",
                    message: "Invalid project_id"
                })      
            }

            const userService = new UsersService()
            const user = await userService.findOne(user_id)
            if (user.status === "error" || !user.data){
                return res.status(400).json({
                    statusCode : 400,
                    status: "error",
                    message: "Invalid user id"
                })
            }

            const newTask = {
                name,
                description,
                project: {
                    project_id
                },
                user: {
                    user_id
                },
                status,
                estimated_start_time,
                estimated_end_time,
                priority
            }

            const result = await service.create(newTask)
            if (result.status === "error" || !result.data){
                return res.status(result.statusCode).json(result)
            }
            res.status(201).json({
                statusCode: 201,
                status: "success",
                message: "Task created successfully",
                data: result.data
            })

            
            await NotificationUtil.notifyUsers(result.data, project.data, "add")
            return
            
            
        } catch (error) {
            console.error(error)
            return res.status(500).json({
                statusCode : 500,
                status: "error",
                message: "Internal server error"
            })
        }
    }

    public async getAllHandler(req : Request, res: Response){
        if (!hasPermission(req?.user?.rights ?? [], "get_all_tasks")){
            return res.status(403).json({
                statusCode : 403,
                status: "error",
                message: "forbidden"
            })
        }

        try{
            const service = new TasksService()
            const results = await service.findAll(req.query)
            if (!results.data){
                return res.status(200).json({
                statusCode : 200,
                status: "success",
                data: [],
                message: "Tasks retrieved successfully"
            })
            }
            
            const shortened = results.data.map((task) => {
                const {
                    description,
                    user_ids, 
                    created_at: project_created_at, 
                    updated_at : project_updated_at,
                    ...project
                    } = task.project
                
                const {
                    email, 
                    role: {
                        role_id
                    }, 
                    created_at : user_created_at, 
                    updated_at : user_updated_at, 
                    fullname,
                    ...user
                    } = task.user

                    return {
                        ...task,
                        project,
                        user
                    }
                
            })
            res.status(200).json({
                statusCode : 200,
                status: "success",
                data: shortened,
                message: "Tasks retrieved successfully"
            })
        } catch(error){
            console.error(error)
            res.status(500).json({
                statusCode : 500,
                status: "error",
                message: "Internal server error"
            })
        }
    }

    public async getOneHandler(req : Request<{id : string}>, res: Response){
        if (!hasPermission(req.user?.rights ?? [], "get_details_task")){
            return res.status(403).json(
                {
                    statusCode : 403,
                    status: "error",
                    message: "Forbidden"
                }
            )
        }
        const service = new TasksService()
        const result = await service.findOne(req.params.id)
        return res.status(result.statusCode).json(result)
    }

    public async updateHandler(req : Request<{id : string}>, res : Response){
        if (!hasPermission(req.user?.rights ?? [], "edit_task")){
            return res.status(403).json(
                {
                    statusCode : 403,
                    status: "error",
                    message: "Forbidden"
                }
            )
        }
        const service = new TasksService()
        const result = await service.update(req.params.id, req.body)
        if (result.status === "error" || !result.data){
            return res.status(result.statusCode).json(result)
        }
        const updatedTask = await service.findOne(req.params.id)
        
        if (updatedTask.status === "success" && updatedTask.data){
            await NotificationUtil.notifyUsers(updatedTask.data, updatedTask.data.project, "update")
        }
        return res.status(result.statusCode).json(result)
    }

    public async deleteHandler(req : Request<{id : string}>, res : Response){
        if (!hasPermission( req.user?.rights ?? [],"delete_task")) {
            return res.status(403).json({
                statusCode: 403,
                status: "error",
                message: "Forbidden"
            })
        }

        const service = new TasksService()
        const task = await service.findOne(req.params.id)
        if (task.status === "error" || !task.data){
            return res.status(task.statusCode).json(task)
        }
        const result = await service.delete(req.params.id)
        if (result.status === "error"){

        }
        res.status(result.statusCode).json(result)
        await NotificationUtil.notifyUsers(task.data, task.data.project , "delete")
        return

    }

}