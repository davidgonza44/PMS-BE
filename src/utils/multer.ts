import multer from 'multer'
import { NextFunction, Request, Response } from 'express'

if (!process.env.ATTACHED_FILES_PATH){
    throw new Error("ATTACHED_FILES_PATH is not defined")
}


export const multerConfig : multer.Options = {
    storage: multer.diskStorage({

        destination: (req, file, cb) => {
            cb(null, process.env.ATTACHED_FILES_PATH || 'uploads')
        },

        filename: (req, file, cb) => {
            const uniqueFileName = `${Date.now()}-${file.originalname}`
            cb(null, uniqueFileName)
        },
    }),  

    fileFilter: (req, file, cb) => {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf']
            if (allowedMimeTypes.includes(file.mimetype)){
                cb(null, true)
            }
            else{
                cb(new Error ("Mimetype not valid"))
            }
        },

    limits: {
        fileSize : 5 * 1024 * 1024
    }
}

const upload = multer(multerConfig)

export const fileUploadMiddleware = (
    req: Request, 
    res: Response, 
    next : NextFunction) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError){
            return res.status(400).json({
                message: err.message
            })
        }

        if (err){
            return res.status(400).json({
                message: err.message
            })
        }
        next()
    })
}


export const extractFile = (req : Request) => {
    if (!req.file){
        throw new Error("No file was uploaded")
    }

    const file = req.file
    return file
}