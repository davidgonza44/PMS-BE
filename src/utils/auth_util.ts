import { NextFunction, Request, Response } from 'express';
import { SERVER_CONST} from "../utils/common.js"
import jwt from 'jsonwebtoken'
import { RolesUtil } from "../utils/roles_utils.js"
import { UsersService } from '../components/users/user_service.js';
import {JwtPayload} from "jsonwebtoken"

//el middleware revisa el token y llena req.user
export const authorize = async(req: Request, res: Response, next : NextFunction) => {
    const token = req.headers?.authorization ? req.headers.authorization.split('Bearer ')[1] : null
    //si hay una header de autorizacion quitale la pababra bearer y guarda solo el token
    if (!token){
        res.status(401).json({ message: 'No token provided' })
        return
    }
    try{
        const decoded = jwt.verify(token, SERVER_CONST.JWT_SECRET) 
        if (typeof decoded === "string" || !decoded.sub) {
            res.status(401).json({ statusCode: 401, status: "error", message: "Invalid token" })
            return
        }
        const userId = decoded.sub
        req.user = {} // crea un espacio para guardar los datos del usuario dentro de la peticion 
        req.user.user_id = userId
        req.user.email = decoded['email'] ?? ''
        req.user.username = decoded['username'] ?? ''

        const service = new UsersService()
        const user = (await service.findOne(userId, {
            role : true
        })).data
        if (!user){
            res.status(401).json({
                statusCode: 401,
                status : "error",
                message: "Invalid token"
            })
            return
        }

        const rights = await RolesUtil.getAllRightsFromRoles([user.role.role_id])
        req.user.rights = rights
        console.log("RIGHTS:", req.user.rights)
        console.log(user.role.role_id)
        console.log(userId)
        next() 

    } catch(error){
        if (error instanceof Error) {
            console.error(error.message)
        } else {
            console.error(error)
        }
        return res.status(401).json({ statusCode : 401, status : 'error', message: 'Invalid Token'})
    }
}

export const hasPermission = (rights : string[], desired_rights: string): boolean => {
    if (rights.includes(desired_rights)){
        return true
    }
    return false
}

export type ResetPasswordPayload = JwtPayload & {email : string}