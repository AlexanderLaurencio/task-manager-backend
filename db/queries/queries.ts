import { type Database } from "sqlite3";
import { QueryProps, TaskStatus, type TaskProps } from "../../types/types.js";
import { getCurrentDate } from "../../utils/date/date.js";
import { returnOrder } from "../../utils/returnOrder/returnOrder.js";

type TotalTasks = { quantity: number }[];


export function insertTask(db: Database, task: TaskProps) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO Tasks (task_title, task_description, task_status, task_priority, 
                    task_due_date, task_creation_date) VALUES 
                    (?,?,?,?,?,?);`,
            [task.task_title, task.task_description,
            task.task_status, task.task_priority,
            task.task_due_date, getCurrentDate()],
            (err) => {
                if (err) {
                    console.log("Error while inserting a new task");
                    reject(err)
                } else {
                    resolve("Task created successfully")
                }
            })
    })
};

export function getAllTasks(db: Database) {
    return new Promise((resolve, reject) => {

        db.all(`SELECT * FROM Tasks
                ORDER BY task_title 
                DESC
                `, (err, rows) => {
            if (err) {
                console.log("Error while getting all the tasks", err);
                reject(err)

            } else {
                resolve(rows)
            }
        })
    })
};

export function getFilteredTasks(db: Database, query: QueryProps) {
    return new Promise((resolve,reject) => {

        console.log(query);

        // if (!query.filter || !query.order || isNaN(query.page)) {
            
        //     console.log("The filter or order in getFilteredTasks are empty");
        //     reject("Filter or order are empty")
        // }

        let filter = query.filter === "all" ? "%" : `%${query.filter}%`;

        let pattern = !query.pattern ? "%" : `%${query.pattern}%`;

        let offset = Number(query.page) * 10;

        let [orderBy, order] = returnOrder(query.order);

        db.all(`SELECT * FROM Tasks
                WHERE task_status LIKE '${filter}' 
                AND task_title LIKE '${pattern}'
                ORDER BY ${orderBy}
                ${order}
                LIMIT 10
                OFFSET ${offset}`, 
                (err, rows) => {

            if (err) {

                console.log("Error while getting filtered tasks",err)
                reject(err)

            } else {

                resolve(rows)

            }

        })
    })
};


//This function isn't being tested because essentially it queries tasks using a filter, a pattern and an order,
//but without a limit, which is what getFilteredTasks does. Basically because this this function is the same as
//getFilteredTasks, but with LIMIT in its SQL query. 
export function getTotalFilteredTasks(db: Database, query: QueryProps) {
    return new Promise((resolve,reject) => {

        if (!query.filter || !query.order || !query.page) {
            
            console.log("The filter or order in getTotalFilteredTasks are empty");
            reject("Filter or order are empty")
        }

        let filter = query.filter === "all" ? "%" : `%${query.filter}%`;

        let pattern; 
        
        if (!query.pattern) {
            pattern = "%"
        } else {
            pattern = `%${query.pattern}%`
        }

        let [orderBy, order] = returnOrder(query.order);

        db.all(`SELECT * FROM Tasks
                WHERE task_status LIKE '${filter}' 
                AND task_title LIKE '${pattern}'`, 
                (err, rows) => {

            if (err) {

                console.log("Error while getting total filtered tasks",err)
                reject(err)

            } else {

                resolve(rows)

            }

        })
    })
};

export function getStats(db: Database) {
    return new Promise((resolve, reject) => {

        db.all(`SELECT task_status, COUNT(task_status) AS quantity FROM Tasks
                    GROUP BY task_status;`, (err, rows) => {

            const stats = {
                completed: 0,
                inProgress: 0,
                pending: 0
            };

            for (const row of rows as {task_status: string, quantity: number}[]) {
                stats[row.task_status as keyof typeof stats] = row.quantity
            }

            if (err) {
                console.log("Error while gettings statistics", err);
                reject(err)
            } else {
                resolve(stats)
            }

        })

    })
};

export function getTotalTasks(db: Database) {

    return new Promise((resolve, reject) => {

        db.all(`SELECT COUNT(task_id) AS quantity FROM Tasks;`, (err, rows) => {
            let records = rows as TotalTasks;

            if (err) {
                console.log("Error while getting total tasks", err);
                reject(err)
            } else {
                resolve(records[0].quantity)
            }
        })

    })
};

export function deleteTask(db: Database, task_id: number) {
    return new Promise((resolve,reject) => {

        db.run(`DELETE FROM Tasks WHERE task_id = ${task_id}`, (err) => {

            if (err) {
                reject(err)
            } else {
                resolve("Delete operation in the database succeded")
            }
            
        })
    })
};

export function getTask(db: Database, taks_id: number) {

    return new Promise((resolve,reject) => {

        db.get(`SELECT * FROM Tasks WHERE task_id = ${taks_id};`, (err, row) => {

            if (err) {
                console.log("Error while getting a task", err);
                reject(err)
            } else {
                resolve(row)
            }
        })

    })
};

export function updateTask(db: Database, task_id: number, task_title: string,
                        task_description: string, task_status: TaskStatus,
                        task_priority: TaskPriority, task_due_date: string
) {

    return new Promise((resolve, reject) => {
        db.run(`UPDATE Tasks SET 
                    task_title = ?,
                    task_description = ?,
                    task_status = ?,
                    task_priority = ?,
                    task_due_date = ?
                    WHERE task_id = ?;`, 
                    [task_title.trim(),task_description.trim(),
                     task_status, task_priority,
                     task_due_date.trim(), task_id
                    ],
                    (err) => {
            if (err) {
                console.log("Error while updating task",err);
                reject(err)
            } else {
                resolve("Task updated successfully")
            }
        })

    })
};

