import Task from './Task';
import RaffleTask from './predefined/RaffleTask';
import SurveyTask from './predefined/SurveyTask';

export default class TaskManager{

    private tasks: Task[] = []

    constructor(){
        this.addTasks([
            new SurveyTask(),
            new RaffleTask()
        ])
    }

    public addTasks(tasks: Task[]): void{
        for(const task of tasks){
            this.addTask(task)
        }
    }

    public addTask(task: Task): void{
        this.tasks.push(task)
    }

    public getTasks(): Task[]{
        return this.tasks
    }

    public async runTasks(): Promise<void>{
        for(const task of this.tasks){
            await task.onRun()
        }
    }

}