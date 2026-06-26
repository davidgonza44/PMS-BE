import { Request, Response } from "express";
import { extractFile } from "../../utils/multer.js";
import { FilesService } from "./files_service.js";
import { Files } from "./files_entity.js";
import { BaseController } from "../../utils/base_controller.js";
import { TasksService } from "../tasks/task_service.js";


export class FileController extends BaseController{
    public async addHandler(req: Request, res: Response){
        try{

            if (!req.user?.user_id){
                return res.status(401).json({
                    statusCode: 401,
                    status: "error",
                    message: "Unauthorized"
            })}

    
            const fileDataFromMulter : Express.Multer.File  = extractFile(req)
            const service = new FilesService()
            const result = await service.createAttachedFiles({
                file : fileDataFromMulter,
                task_id : req.body.task_id,
                user_id : req.user.user_id
            })
            return res.status(result.statusCode).json(result)

        } catch(error){
            if (error instanceof Error){
                return res.status(400).json({
                    statusCode : 400,
                    status: "error",
                    message: error.message
                })
            }

            return res.status(500).json({
                statusCode : 500,
                status: "error",
                message: "Internal Server Error"
            })
        }
        
        
    }

    public async getAllHandler(){

    }

    public async getOneHandler(req: Request<{id : string}>, res: Response){
        const service = new FilesService()
        const result = await service.findOne(req.params.id, {
            task : {
                project : true
            },
            user: true
        })

        if (result.status === "error" || !result.data){
            return res.status(result.statusCode).json(result)
        }

        if (!req.user?.user_id){
            return res.status(403).json({
                message: "No hay user id"
            })
        }

        const userId = req.user?.user_id
        const canAccess = service.canAccess(result.data, userId)

        if (!canAccess ){
            return res.status(403).json({
                statusCode : 403,
                status: "error",
                message: "forbidden"
            })
        }

        const path = service.buildFilePath(result.data.file_name)

        res.sendFile(path, (err) => {
            if (err){
                console.error('error: ', err)
                return res.status(500).json({err : err.message})
            }
            return res.status(200).end()
        })
    }

    public async updateHandler(){

    }

    public async deleteHandler(){

    }

}