import { Files } from "./files_entity.js"
import { BaseService } from "../../utils/base_service.js"
import { DatabaseUtil } from "../../utils/db.js"
import { fileDTO } from "../../utils/files_util.js"
import { TasksService } from "../tasks/task_service.js"
import path from "node:path";

export class FilesService extends BaseService<Files>{
    constructor(){
        const repository = new DatabaseUtil().getRepository(Files)
        super(repository)
    }

    public async createAttachedFiles(input : fileDTO){
        const taskService = new TasksService()
        const taskResult = await taskService.findOne(input.task_id)
        if (taskResult.status === "error" || !taskResult.data){
            return {
                statusCode: 400,
                status: "error",
                message: "Invalid Task Id"
            }
        }
        const fileData = {
            file_name: input.file.filename,
            mime_type : input.file.mimetype,
            task: {task_id : input.task_id},
            user: {user_id : input.user_id}
        }
        
        return this.create(fileData)
    }

    public buildFilePath(file_name : string)  {
        return path.resolve(process.env.ATTACHED_FILES_PATH || "uploads", file_name)
    }

    public canAccess(file : Files, user_id : string){
        console.log("user_id: ", user_id)
        const isOwner = user_id === file.user.user_id
        const isProjectMember = file.task.project.user_ids.includes(user_id)
        if (!isOwner && !isProjectMember){
            return false
        }
        return true
    }
}