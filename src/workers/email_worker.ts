import "dotenv/config"
import { NotificationUtil } from "../utils/notification_util.js"
import { QueueWorker } from "./queue_worker.js"

const start = async () => {
    await NotificationUtil.initialize()
    QueueWorker.beginProcessing()

    console.log(`Email worker running with pid ${process.pid}`)
}

start().catch((error) => {
    console.error("Email worker failed:", error)
    process.exit(1)
})