import {BaseService} from "../../utils/base_service.js";
import { Tasks } from "./tasks_entity.js";
import { DatabaseUtil } from "../../utils/db.js";
import { ApiResponse } from "../../utils/base_service.js";


export class TasksService extends BaseService<Tasks>{
    constructor(){
        const repository = new DatabaseUtil().getRepository(Tasks)
        super(repository)
    }
    
    override async findAll(queryParams : Record<string, any>): Promise<ApiResponse<Tasks[]>>  {
        const query = this.repository.createQueryBuilder("task")
                        .leftJoinAndSelect("task.user", "user")
                        .leftJoinAndSelect("task.project", "project")

        const validColumns = this.repository.metadata.columns.map((column) => column.propertyName)  
        for (const filter in queryParams){
            const value = queryParams[filter]

            if (filter === "project_id"){
                query.andWhere(`project.project_id = :project_id`, {project_id : value})
                continue
            }

            if (filter === "user_id"){
                query.andWhere(`user.user_id = :user_id`, {user_id : value})
                continue
            }

            if (validColumns.includes(filter)){
                query.andWhere(`task.${filter} = :${filter}`, {[filter] : value})
            }
        }

        try {  
            const result = await query.getMany()
            return {
                statusCode : 200,
                status: "success",
                data : result
            }
        } catch (error) {
            return {
                statusCode : 500,
                status: "error",
                message: "Internal server error"
            }
        }       
    }

    override async findOne(id : string): Promise<ApiResponse<Tasks>>{
        try {
            const primaryKey = this.repository.metadata.primaryColumns[0].propertyName
            const query = await this.repository.createQueryBuilder('task')
                            .leftJoin("task.user", "user")
                            .leftJoin("task.project", "project")
                            .select([
                            "task.task_id",
                            "task.name",
                            "task.status",
                            "task.priority",
                            "task.description",
                            "task.estimated_start_time",
                            "task.estimated_end_time",
                            "project.project_id",
                            "project.name",
                            "user.user_id",
                            "user.username"
    
                            ])
                            .where(`task.task_id = :id`, {id})
                            .getOne()
            if (!query){
                return {
                    statusCode : 404,
                    status: "error",
                    message: "not found"
                }
            }
    
            return {
                statusCode : 200,
                status: "success",
                data: query
            }

        } catch(error){
            return {
                statusCode : 500,
                status: "error",
                message: "Internal server error"
            }
        }
        
}}