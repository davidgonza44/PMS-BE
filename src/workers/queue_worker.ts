import { JoinTable } from "typeorm";
import { NotificationUtil } from "../utils/notification_util.js";
import Queue from "bull"

export class QueueWorker {
    private static emailQueue = new Queue("emailQueue", "redis://127.0.0.1:6379")
    private static MAX_ATTEMPTS = 4

    public static beginProcessing() : void{
        QueueWorker.emailQueue.process(async(job) => {
            try{
                const {subject, body, to } = job.data
                await NotificationUtil.sendEmail({to, subject, body})

            } catch(error){
                console.error('error sending email: ', error)
                throw error
            }
        })

        QueueWorker.emailQueue.on('failed', (job, err) => {
            console.error(`Job permanently failed for ${job.data.to}: ${err.message}`);
        })
    }

    public static async closeQueue(){
        await QueueWorker.emailQueue.close()
    }
}