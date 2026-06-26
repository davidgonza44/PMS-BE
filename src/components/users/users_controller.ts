import { Request, Response } from "express";
import { encryptString } from "../../utils/common.js";
import { checkValidRoleIds } from "../../utils/common.js";
import { UsersService } from "./user_service.js";
import {bcryptCompare, SERVER_CONST } from "../../utils/common.js";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { hasPermission } from "../../utils/auth_util.js";
import { sendmail} from "../../utils/email_util.js";
import { ResetPasswordPayload} from "../../utils/auth_util.js"
import { BaseController } from "../../utils/base_controller.js";
import { CacheUtil } from "../../utils/cache_util.js"
import { RolesService } from "../roles/role_service.js";


export class UserController extends BaseController{
    public async addHandler(req: Request, res: Response) {
        if (!hasPermission(req.user?.rights ?? [], 'add_user')){
            res.status(403).json({
                statusCode : 403, 
                status : "error", 
                message: "Unathorized"
            })
            return
        }
        try{
            const {email, password, username, fullname, role_id} = req.body
            const RoleService = new RolesService()
            const isIdExist = await RoleService.findOne(role_id, {
                users: true
            })

            if (isIdExist.status === "error") {
                res.status(400).json({message : 'role_id is invalid'})
                return
            }

            const service = new UsersService()
            const user = {
                'fullname': fullname ? fullname.toLowerCase() : null,
                'username': username.toLowerCase(),
                'password': await encryptString(password),
                'email': email.toLowerCase(),
                'role': {role_id}
            }        

            const result = await service.create(user)
            res.status(result.statusCode).json(result)

        } catch(error){
            console.log(error)
            res.status(500).json({message : 'Internal server error'})
        }
    }

    public async getAllHandler(req : Request, res: Response){
        if (!hasPermission(req.user?.rights ?? [], "get_all_users")){
            res.status(403).json({
                statusCode: 403,
                status : "error",
                message: "Unauthorized"
            })
            return
        }
        const service = new UsersService()
        const result =  await service.findAll(req.query) // busca registros usando los filtros que llegaron por la url
        res.status(result.statusCode).json(result)
        return
    }

    public async getOneHandler(req : Request<{id : string}>, res: Response){
        if (!hasPermission(req.user?.rights ?? [], "get_details_user")){
            console.log('AQUI: ', req.user?.rights)
            res.status(403).json({
                statusCode : 403 , status : "error", message : "Unauthorized"
            })
            return
        }
        const userFromCache = CacheUtil.get("User", req.params.id)
        if (userFromCache){
            return res.status(200).json({
                statusCode: 200,
                status : "success",
                data: userFromCache
            })
        }

        const service = new UsersService()
        const result = await service.findOne(req.params.id ) //esp a q  el ser busq us en la bd usando vb q llego de la url
        
        if (result.status === "success" && result.data){
            await CacheUtil.set("User", req.params.id, result.data)
        }

        res.status(result.statusCode).json(result)
    }

    public async updateHandler(req : Request<{id : string}>, res: Response){
        if (!hasPermission(req.user?.rights ?? [], "edit_user")){
            res.status(403).json({
                statusCode : 403,
                status : "error",
                message : "unathorized"
            })
            return
        }
        const service = new UsersService()
        const user = req.body
        const {email, username, role_id, ...fields} = user
        const updateData = {
            ...fields,
            ...(
                role_id && {
                    role: role_id
                }
            )
        }
        const result = await service.update(req.params.id, updateData) 
        res.status(result?.statusCode ?? 500).json(result)
    }

    public async deleteHandler(req : Request<{id : string}>, res: Response){
        if (!hasPermission(req.user?.rights ?? [], "delete_user")){
            res.status(403).json({
                statusCode: 403 , status : "error" , message: "Unauthorized"
            })
        }
        const service = new UsersService()
        const result = await service.delete(req.params.id)
        if (result.status === "success"){
            await CacheUtil.remove("User", req.params.id)
        }
        res.status(result.statusCode).json(result)
        return
    }

    public async login(req: Request, res: Response) : Promise<void>{
        const { email , password } = req.body
        const service = new UsersService()
        const user = await service.findByEmailWithPassword(email)
        
        if (!user){
            res.status(401).json({
                statusCode : 401,
                status : "error",
                message : "Invalid email or password"
            })
            return
        }

        const hash = user.password
        const isSame = await bcryptCompare( password , hash)
        if (!isSame){
            res.status(401).json({
                statusCode : 401,
                status : "error",
                message : "Invalid email or password"
            })
            return
        }
        const access_token = jwt.sign(
            {sub: user.user_id, email: email , username : user.username },
            SERVER_CONST.JWT_SECRET,
            {expiresIn : 
                SERVER_CONST.ACCESS_TOKEN_EXPIRY
            }
        )

        const refresh_token = jwt.sign(
            { sub: user.user_id, email: email , username : user.username },
            SERVER_CONST.JWT_SECRET,
            {expiresIn : 
                SERVER_CONST.REFRESH_TOKEN_EXPIRY
            }
        )

        res.status(200).json({statusCode : 200, status : "success", data: {
            access_token,
            refresh_token
        }})
        return     
    }
    public async getAccessTokenFromRefreshToken(req: Request, res: Response): Promise<void>{
        const { refresh_token } = req.body
        jwt.verify(refresh_token, SERVER_CONST.JWT_SECRET, (err, user) => {
            if (err){
                res.status(403).json({
                    statusCode : '403',
                    status: "error",
                    message : "Invalid refresh token"                  
                })
                return
            }
            const {iat, exp, ...payload} = user
            const access_token = jwt.sign(payload, SERVER_CONST.JWT_SECRET, { expiresIn : SERVER_CONST.ACCESS_TOKEN_EXPIRY })
            res.status(200).json({ statusCode : 200, status : "success", data: { access_token } })
            return
        })
    }

    public async changePassword(req: Request<{id : string}>, res : Response): Promise<void>{
        const service = new UsersService()
        const user = await service.findByIdWithPassword(req.params.id)
        if (!user){
            res.status(404).json({
                status : "error",
                statusCode : 404,
                message: "User not found"
            })
            return
        }
        const {oldPassword, newPassword} = req.body
        const isSame = await bcryptCompare(oldPassword, user.password)
        if (!isSame){
            res.status(400).json({
                statusCode : 400,
                status : "error",
                message: "User can change only own password"
            })
            return
        }
        const encryptedPassword = await encryptString(newPassword)
        const result = await service.update(
            req.params.id, 
            {"password": encryptedPassword}
        )

        if (result.statusCode !== 200){
            res.status(result.statusCode).json(result)
            return
        }

        res.status(200).json({
            statusCode : 200,
            status: "success",
            message: "Password is updated successfully"
        })
    }

    public async forgotPassword(req: Request, res : Response){
        const {email} = req.body
        const service = new UsersService()
        const result = await service.customQuery(
            'entity.email = :email', {email}
        )
        if (result.length < 1){
            res.status(404).json({
                statusCode : 404,
                status: "error",
                message: "user not found"
            })
            return
        }

        const reset_token = jwt.sign(
            {email},
            process.env.JWT_SECRET!,
            {expiresIn : "1h"}
        )

        if(!process.env.FRONTEND_URL){
            throw Error("Frontend url is not defined")
        }
        
        const reset_link = `${process.env.FRONTEND_URL}/reset-password?token=${reset_token}`
        const mail_options = {
            to: email,
            subject: "password reset",
            html: `Hello,<p>We received a request to reset your password. If you didn't initiate this request, please ignore this email.</p>
            <p>To reset your password, please click the link below:</p>
            <p><a href="${reset_link}" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">Reset Password</a></p>
            <p>If the link doesn't work, you can copy and paste the following URL into your browser:</p>
            <p>${reset_link}</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>PMS Team</p>`
        }

        const isEmailSent = await sendmail(mail_options.to, mail_options.subject, mail_options.html)
        if (!isEmailSent){
            res.status(500).json({
                statusCode: 500,
                status: "error",
                message: "Failed to send reset email"
            })
        }

        res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "Reset Link Sent to email if it is registered"
        })
    }

    public async resetPassword(req : Request, res: Response){
        if (!process.env.JWT_SECRET){
            throw Error("JWT SECRET is not defined")
        }
        const {token, newPassword } = req.body
        const service = new UsersService()
        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err){
                res.status(403).json({
                    statusCode: 403,
                    status: "Error",
                    message: 'Invald Token'
                })
                return
            }
            const {email} = user as ResetPasswordPayload
            const userFound = await service.customQuery(
                'entity.email = :email',
                {email}
            )
            if (userFound.length < 1){
                res.status(404).json({
                    statusCode : 404,
                    status: "error",
                    message: "User not found for this reset token"
                })
                return
            }

            const hashedNewPassword = await encryptString(newPassword)
            const updatedUser = await service.update(userFound[0].user_id, {
                password: hashedNewPassword
            })

            if (updatedUser.statusCode !== 200 ){
                res.status(updatedUser.statusCode).json(updatedUser)
                return
            }


            res.status(200).json({
                statusCode : 200,
                status: "success",
                message: "password updated successfully"
            })
        })
    }
    
}

