import { AsyncDocumentTask } from '../AsyncTask';
import { ShardingManager } from 'discord.js';

export default class ShardingTaskManager{

    private readonly sharding: ShardingManager

    private tasks: AsyncDocumentTask[] = []

    constructor(sharding: ShardingManager, predefinedTasks: AsyncDocumentTask[]){
        this.sharding = sharding

        this.addTasks(predefinedTasks)
    }

    public addTasks(tasks: AsyncDocumentTask[]): void{
        for(const task of tasks){
            this.addTask(task)
        }
    }

    public addTask(task: AsyncDocumentTask): void{
        this.tasks.push(task)
    }

    public getTasks(): AsyncDocumentTask[]{
        return this.tasks
    }

    public async runTasks(): Promise<void>{
        for(const task of this.tasks){
            task.onRun().then(items => {
                task.onCompletion(this.sharding, items)
            })
        }
    }

}
