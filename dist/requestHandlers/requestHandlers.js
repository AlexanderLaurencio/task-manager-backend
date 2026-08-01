import { CONTENT_TYPE, server } from "../constants/constants.js";
import { insertTask, getStats, getTotalTasks, deleteTask, updateTask, getFilteredTasks, getTotalFilteredTasks } from "../db/queries/queries.js";
import { isBeforeToday } from "../utils/date/date.js";
import { checkStatusAndPriority } from "./checkValues/checkValues.js";
export function handlePostRequest(db, request, response) {
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
            request.destroy();
        }
        ;
        body += chunk;
    });
    request.on("end", async () => {
        const newTask = JSON.parse(body);
        try {
            if (!newTask.task_title || !newTask.task_description || !newTask.task_status || !newTask.task_due_date || !newTask.task_priority) {
                response.writeHead(400, {
                    "Content-Type": CONTENT_TYPE.json
                });
                response.end(JSON.stringify({ isError: true, message: "One of the fields is empty" }));
                return;
            }
            ;
            if (isBeforeToday(newTask.task_due_date)) {
                console.log("Due date is before today");
                response.writeHead(400, {
                    "Content-Type": CONTENT_TYPE.json
                });
                response.end(JSON.stringify({ isError: true, message: "Due date is before today" }));
                return;
            }
            ;
            if (checkStatusAndPriority(response, newTask.task_status, newTask.task_priority))
                return;
            await insertTask(db, newTask);
            response.writeHead(200, {
                "Content-Type": CONTENT_TYPE.json
            });
            response.end(JSON.stringify({ isError: false, message: "No error" }));
        }
        catch (error) {
            console.log("Error while inserting new task", error);
            response.writeHead(500, {
                "Content-Type": CONTENT_TYPE.json
            });
            response.end(JSON.stringify({ isError: true, message: "Internal Server Error" }));
        }
    });
}
;
export async function handleQueryRequest(db, request, response) {
    let body = "";
    request.on("error", (err) => {
        console.log("Error handling get request", err);
        response.writeHead(400, {
            "Content-Type": CONTENT_TYPE.json
        });
        response.end(JSON.stringify({ isError: true, message: "Error handling request" }));
    });
    request.on("data", (chunk) => {
        if (chunk.length > 1_000_000) {
            response.writeHead(413, {
                "Content-Type": CONTENT_TYPE.text
            });
            response.end("Body request too large");
        }
        ;
        body += chunk;
    });
    request.on("end", async () => {
        // let query = JSON.parse(body) as QueryProps;
        let url = new URL(request.url, server);
        let urlParams = new URLSearchParams(url.search);
        let filter = urlParams.get("filter");
        let order = urlParams.get("order");
        let pattern = urlParams.get("pattern");
        let page = Number(urlParams.get("page"));
        let query = { filter: filter, order: order, pattern: pattern, page: page };
        console.log(query);
        try {
            let tasks = await getFilteredTasks(db, query);
            let rowsNumber = await getTotalFilteredTasks(db, query);
            const stats = await getStats(db);
            const totalTasks = await getTotalTasks(db);
            response.writeHead(200, {
                "Content-Type": CONTENT_TYPE.json
            });
            response.end(JSON.stringify({ tasks: tasks, stats: stats, totalTasks: totalTasks, rowsNumber: rowsNumber.length }));
        }
        catch (error) {
            console.log("Error getting tasks", error);
            response.writeHead(500, {
                "COntent-Type": CONTENT_TYPE.json
            });
            response.end(JSON.stringify({ isError: true, message: "Error getting all tasks" }));
        }
    });
}
;
export async function handleDeleteRequest(db, request, response) {
    let urlSplitted = request.url.split("/");
    let taskId = Number(urlSplitted[1]);
    request.on("error", (err) => {
        console.log("Error deleting task", err);
        response.writeHead(500, {
            "Content-Type": CONTENT_TYPE.text
        });
        response.end("Invalid request");
    });
    try {
        if (!taskId) {
            response.writeHead(400, {
                "Content-Type": CONTENT_TYPE.text
            });
            response.end("Invalid ID");
            return;
        }
        await deleteTask(db, taskId);
        response.writeHead(200, {
            "Content-Type": CONTENT_TYPE.text
        });
        response.end("Task deleted successfully");
    }
    catch (error) {
        console.log("Error catched while deleting task", error);
        response.writeHead(500, {
            "Content-Type": CONTENT_TYPE.text
        });
        response.end("Internal Server Error while deleting task");
    }
}
;
export async function handlePutRequest(db, request, response) {
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
            response.end("Request body too large");
        }
        ;
        body += chunk;
    });
    request.on("end", () => {
        try {
            let task = JSON.parse(body);
            if (!Number(task.task_id) || !task.task_title || !task.task_description
                || !task.task_status || !task.task_priority || !task.task_due_date) {
                console.log("One of the fields is empty or contains invalid values");
                response.writeHead(400, {
                    "Content-Type": CONTENT_TYPE.text
                });
                response.end("One of the fields is empty or contains invalid values");
                return;
            }
            if (isBeforeToday(task.task_due_date)) {
                console.log("Due Date is before today");
                response.writeHead(400, {
                    "Content-Type": CONTENT_TYPE.text
                });
                response.end("Due Date is before today");
                return;
            }
            if (checkStatusAndPriority(response, task.task_status, task.task_priority))
                return;
            updateTask(db, task.task_id, task.task_title, task.task_description, task.task_status, task.task_priority, task.task_due_date);
            response.writeHead(200, {
                "Content-Type": CONTENT_TYPE.text
            });
            response.end("Task updated successfully");
        }
        catch (error) {
            console.log("Error while reading request body", error);
            response.writeHead(400, {
                "Content-Type": CONTENT_TYPE.text
            });
            response.end("Invalid JSON");
        }
    });
}
;
//All these functions aren't being tested in a separate file bceause I'm already testing their expected 
//behavior in app.test.ts
