export type TaskStatus = "completed" | "pending" | "inProgress";

export type TaskPriority = "low" | "medium" | "high";

export interface StatsProps {
    stats: {
        totalTasks: number,
        completed: number,
        pending: number,
        overdue: number,
        inProgress: number,
    }
    StatsDataTestId?: string,
}; 

export interface TaskProps{
    task_title: string,
    task_description: string,
    task_status: TaskStatus,
    task_priority: TaskPriority,
    task_due_date: string,
        
};

export interface TaskPropsExtended extends TaskProps {
    task_id: number,
    task_creation_date?: string
}


export interface QueryProps {
    pattern: string | null | undefined,
    order: Order,
    filter: Filter,
    page: number
};

export type Order = "a-z" | "z-a" | "earliestCreationDate" | "latestCreationDate";

export type Filter = TaskStatus & "all";