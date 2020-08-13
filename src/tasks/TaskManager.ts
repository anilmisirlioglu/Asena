import Task from './Task';
import RaffleTask from './predefined/RaffleTask';
import SurveyTask from './predefined/SurveyTask';
import { StructureType } from '../structures/Structure';

export default class TaskManager{

    private tasks: Task<StructureType>[] = []

    constructor(){
        this.addTasks([
            new SurveyTask(),
            new RaffleTask()
        ])
    }

    public addTasks(tasks: Task<StructureType>[]): void{
        for(const task of tasks){
            this.addTask(task)
        }
    }

    public addTask(task: Task<StructureType>): void{
        this.tasks.push(task)
    }

    public getTasks(): Task<StructureType>[]{
        return this.tasks
    }

    public async runTasks(): Promise<void>{
        for(const task of this.tasks){
            await task.onRun()
        }
    }

}
