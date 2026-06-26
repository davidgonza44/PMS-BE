import { CacheUtil } from "../../utils/cache_util.js";
import { DatabaseUtil } from "../../utils/db.js";
import { QueueWorker } from "../../workers/queue_worker.js";

export function setupIntegrationDatabase() {
    beforeAll(async() => {
    await DatabaseUtil.getInstance()

}, 30000)

afterAll(async() => {
    await DatabaseUtil.closeConnection()
    await CacheUtil.closeConnection()
    await QueueWorker.closeQueue()
})
}