import { IncomingMessage, ServerResponse } from "node:http"
import { CONTENT_TYPE, server } from "../constants/constants.js";
import { type Database } from "sqlite3";
import { insertTask, getStats, getTotalTasks, deleteTask, updateTask, getFilteredTasks, getTotalFilteredTasks, getAllTasks } from "../db/queries/queries.js";
import { Filter, Order, QueryProps, TaskProps, TaskPropsExtended } from "../types/types.js";
import { isBeforeToday } from "../utils/date/date.js";
import { checkStatusAndPriority } from "../utils/checkValues/checkValues.js";

export function handlePostRequest(db: Database, request: IncomingMessage, response: ServerResponse) {
    let body = "";

    request.on("error", (err) => {

        if (err) {
            console.log("Error while receiving request", err);

            response.writeHead(500, { "Content-Type": CONTENT_TYPE.json });
            response.end(JSON.stringify({ isError: false, message: "Invalid request" }));

        }

    });

    request.on("data", (chunk) => {

        if (body.length > 1_000_000) {
            response.writeHead(413, { "Content-Type": CONTENT_TYPE.json });
            response.end(JSON.stringify({ isError: true, message: "Request body too large" }));

            request.destroy()
        };

        body += chunk
    });

    request.on("end", async () => {
        const newTask = JSON.parse(body) as TaskProps;

        try {

            if (!newTask.task_title || !newTask.task_description || !newTask.task_status || !newTask.task_due_date || !newTask.task_priority) {
                response.writeHead(400, {
                    "Content-Type": CONTENT_TYPE.json
                });
                response.end(JSON.stringify({ isError: true, message: "One of the fields is empty" }));
                return
            };

            if (isBeforeToday(newTask.task_due_date)) {
                console.log("Due date is before today");
                response.writeHead(400, {
                    "Content-Type": CONTENT_TYPE.json
                });
                response.end(JSON.stringify({ isError: true, message: "Due date is before today" }));
                return
            };

            if (checkStatusAndPriority(response,newTask.task_status,newTask.task_priority)) return

            await insertTask(db, newTask);

            response.writeHead(200, {
                "Content-Type": CONTENT_TYPE.json
            });

            response.end(JSON.stringify({ isError: false, message: "No error" }));

        } catch (error) {
            console.log("Error while inserting new task", error);

            response.writeHead(500, {
                "Content-Type": CONTENT_TYPE.json
            });

            response.end(JSON.stringify({ isError: true, message: "Internal Server Error" }))
        }
    })
};

export async function handleQueryRequest(db: Database, request: IncomingMessage, response: ServerResponse) {
    let body = "";

    request.on("error", (err) => {

        console.log("Error handling get request", err);

        response.writeHead(400, {
            "Content-Type": CONTENT_TYPE.json
        });

        response.end(JSON.stringify({ isError: true, message: "Error handling request" }))
    });


    request.on("data", (chunk) => {

        if (chunk.length > 1_000_000) {

            response.writeHead(413, {
                "Content-Type": CONTENT_TYPE.text
            });

            response.end("Body request too large");

        };

        body += chunk

    });

    request.on("end", async () => {
        let url = new URL(request.url!, server);
        
        let urlParams = new URLSearchParams(url.search);

        let filter = urlParams.get("filter") as Filter; 

        let order = urlParams.get("order") as Order;

        let pattern = urlParams.get("pattern") as string;

        let page = Number(urlParams.get("page")) as number;

        let query = {filter: filter, order: order, pattern: pattern, page: page} as QueryProps;

        try {

            let tasks = await getFilteredTasks(db,query) as TaskProps[];
            let totalFilteredTask = await getTotalFilteredTasks(db,query) as TaskProps[];

            const stats = await getStats(db);
            const totalTasks = await getTotalTasks(db);
    
            let body = { tasks: tasks, stats: stats, totalTasks: totalTasks, rowsNumber: totalFilteredTask };

            response.writeHead(200, {
                "Content-Type": CONTENT_TYPE.json
            });

            console.log(totalFilteredTask);

            response.end(JSON.stringify(body));

        } catch (error) {

            console.log("Error getting tasks", error)
            response.writeHead(500, {
                "COntent-Type": CONTENT_TYPE.json
            });
            response.end(JSON.stringify({ isError: true, message: "Error getting all tasks" }))
        }
        
    });

};

export async function handleDeleteRequest(db: Database, request: IncomingMessage, response: ServerResponse) {
    let url = new URL(request.url!, server);
        
    let urlParams = new URLSearchParams(url.search);
    let taskId = Number(urlParams.get("id"));

    request.on("error", (err) => {
        console.log("Error deleting task", err)

        response.writeHead(500, {
            "Content-Type": CONTENT_TYPE.text
        });

        response.end("Invalid request")
    });

    try {
        if (!taskId) {

            response.writeHead(400, {
                "Content-Type": CONTENT_TYPE.text
            });

            response.end("Invalid ID");
            return
        }

        await deleteTask(db, taskId)

        response.writeHead(200, {
            "Content-Type": CONTENT_TYPE.text
        });

        response.end("Task deleted successfully")

    } catch (error) {

        console.log("Error catched while deleting task", error);

        response.writeHead(500, {
            "Content-Type": CONTENT_TYPE.text
        });

        response.end("Internal Server Error while deleting task")
    }
};

export async function handlePutRequest(db: Database, request: IncomingMessage, response: ServerResponse) {
    let body = "";

    request.on("error", (err) => {

        response.writeHead(500, {
            "Content-Type": CONTENT_TYPE.text
        });

        response.end("Invalid request");
    });

    request.on("data", (chunk) => {

        if (chunk.length >= 1_000_000) {

            response.writeHead(413, {
                "Content-Type": CONTENT_TYPE.text
            });
            response.end("Request body too large")
        };

        body += chunk
    });

    request.on("end", () => {

        try {

            let task = JSON.parse(body) as TaskPropsExtended;


            if (!Number(task.task_id) || !task.task_title || !task.task_description
                || !task.task_status || !task.task_priority || !task.task_due_date) {

                console.log("One of the fields is empty or contains invalid values");

                response.writeHead(400, {
                    "Content-Type": CONTENT_TYPE.text
                });

                response.end("One of the fields is empty or contains invalid values");

                return
            }

            if (isBeforeToday(task.task_due_date)) {

                console.log("Due Date is before today");

                response.writeHead(400, {
                    "Content-Type": CONTENT_TYPE.text
                });

                response.end("Due Date is before today");

                return
            }

            if (checkStatusAndPriority(response,task.task_status,task.task_priority)) return

            updateTask(db, task.task_id, task.task_title, task.task_description, 
                       task.task_status, task.task_priority as TaskPriority, task.task_due_date)

            response.writeHead(200, {
                "Content-Type": CONTENT_TYPE.text
            });

            response.end("Task updated successfully");

        } catch (error) {

            console.log("Error while reading request body", error);

            response.writeHead(400, {
                "Content-Type": CONTENT_TYPE.text
            });

            response.end("Invalid JSON")
        }

    })
};

//All these functions aren't being tested in a separate file bceause I'm already testing their expected 
//behavior in app.test.ts