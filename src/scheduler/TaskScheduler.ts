import cron from 'node-cron';
import { ShardingManager } from 'discord.js';
import { AsyncDocumentTask } from './AsyncTask';
import ShardingTaskManager from './managers/ShardingTaskManager';

export default class TaskScheduler{

    private readonly taskManager: ShardingTaskManager

    constructor(sharding: ShardingManager, tasks: AsyncDocumentTask[] = []){
        this.taskManager = new ShardingTaskManager(sharding, tasks)
    }

    /* Simple timer */
    public startTimer(period: string = '* * * * *'){
        cron.schedule(period, async () => {
            await this.taskManager.runTasks()
        })
    }

}
