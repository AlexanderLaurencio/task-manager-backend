import { type TaskStatus, type TaskPriority } from "../../types/types.js";
import { ServerResponse } from "node:http"
import { CONTENT_TYPE } from "../../constants/constants.js";


export function checkStatusAndPriority(response: ServerResponse, taskStatus: TaskStatus, taskPriority: TaskPriority) {
    if (!["completed", "pending", "isPending"].includes(taskStatus)) {

        response.writeHead(400, {
            "Content-Type": CONTENT_TYPE.text
        });

        response.end(JSON.stringify({ isError: true, message: "task status incorrect" }));

        return true
    }

    if (!["high", "medium", "low"].includes(taskPriority)) {
        
        response.writeHead(400, {
            "Content-Type": CONTENT_TYPE.text
        });

        response.end(JSON.stringify({ isError: true, message: "task priority incorrect" }));

        return true
    }
};
