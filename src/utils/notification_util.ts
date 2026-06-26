import nodemailer from "nodemailer"
import Queue from "bull"
import {Tasks} from "../components/tasks/tasks_entity.js"
import { Projects } from "../components/projects/projects_entity.js"
import { UsersService } from "../components/users/user_service.js"
import { Users } from "../components/users/users_entity.js"

type NotificationAction = "add" | "update" | "delete"
type NotificationContent = {
    body : string,
    subject : string
}

export class NotificationUtil{
    private static transporter : nodemailer.Transporter
    private static emailQueue = new Queue('emailQueue', 'redis://127.0.0.1:6379')

    private static getNotificationContent(task : Tasks, action : NotificationAction){
        const messages : Record<NotificationAction, NotificationContent > = {
            add: {
                subject: 'New Task Created',
                body: `A new task has been created with title ${task.name}
                and description ${task.description}
                `
            },
            update: {
                subject: 'Task Updated',
                body : `A new task has been updated with title ${task.name}
                and description ${task.description}
                `
            },
            delete: {
                subject: 'Task Deleted',
                body: `A new task has been deleted with title ${task.name}
                and description ${task.description}
                `
            }
        }

        return messages[action]
    }

    public static async notifyUsers(task : Tasks, project: Projects, action : NotificationAction){
        const no_user_ids = project.user_ids.length === 0
        if (no_user_ids){
            return
        }
        const userService = new UsersService()
        const users : Users[] = (await Promise.all(project.user_ids.map(async(user_id) => {
            return (await userService.findOne(user_id)).data
        }))).filter((user) : user is Users => Boolean(user))

        const {subject, body} = NotificationUtil.getNotificationContent(task, action)

        for (const user of users){
            await NotificationUtil.enqueueEmail({
                to: user.email,
                subject,
                body
            })
        }

    }

    static async initialize(){
        if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD ){
            throw new Error("Credentials are missing")
        }

        if (!NotificationUtil.transporter){
            NotificationUtil.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_USER ,
                    pass : process.env.MAIL_PASSWORD
                }
            })
        }
    }

    public static async sendEmail(input  : {
        subject : string,
        body: string,
        to: string
    }){

        if (!process.env.MAIL_FROM) {
            throw new Error("MAIL_FROM is not defined")
        }

        try{

            const status = await NotificationUtil.transporter.sendMail({
                to: input.to,
                from : process.env.MAIL_FROM,
                html: input.body,
                subject : input.subject
            })
            
            if (!status?.messageId){
                throw new Error(
                    'There was a problem sending the notification.'
                )
            }
            
            return status.messageId

        } catch(error){
            throw new Error(
                error instanceof Error ? `There was a problem sending the notification:
                    ${error.message}
                ` : 'There was a problem sending the notification'
            )
        }
    }

    public static async enqueueEmail(input : {to: string, subject: string, body: string}){
        await NotificationUtil.emailQueue.add(
            input,
            {
                attempts : 4,
                backoff: {
                    type: "exponential",
                    delay: 5000
                }
            }
        )
    }
}