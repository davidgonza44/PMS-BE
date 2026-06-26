import * as nodemailer from 'nodemailer';

export const sendmail = async(to : string, subject : string, body : string) => {
    try{
        if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
            throw new Error("Faltan las variables MAIL_USER o MAIL_PASSWORD");
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth :{
                user : process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        }
        )
        
        const emailOptions = { //estoy preparando el correo antes de enviarlo
            from: process.env.MAIL_USER,
            to: to,
            subject: subject,
            html: body
        }
        
        const status = await transporter.sendMail(emailOptions)
        if (status?.messageId){
            return status.messageId
            //Si Nodemailer me devuelve un identificador del mensaje,
            //  lo tomo como señal de que el correo se mandó bien
        }       
        return false

    } catch(error){
        if (error instanceof Error){
            console.log(`error= ${error.message}`)
        }
        return false
    }
}