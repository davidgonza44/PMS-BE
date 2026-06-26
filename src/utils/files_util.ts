import { Multer } from "multer"

export type fileDTO =  {
    file : Express.Multer.File,
    task_id : string,
    user_id : string
}