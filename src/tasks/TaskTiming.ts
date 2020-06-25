import cron from 'node-cron';
import TaskManager from './TaskManager';

export default class TaskTiming{

    private taskManager: TaskManager = new TaskManager()

    /* Simple timing */
    public startTimings(period: string = '* * * * *'){
        cron.schedule(period, async () => {
            await this.getTaskManager().runTasks()
        })
    }

    public getTaskManager(): TaskManager{
        return this.taskManager
    }

}