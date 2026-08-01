import http, { IncomingMessage, ServerResponse } from "node:http";
import sqlite3 from "sqlite3";
import { type Database } from "sqlite3";
import { handleDeleteRequest, handleQueryRequest, handlePostRequest, handlePutRequest } from "./requestHandlers/requestHandlers.js";
import { CONTENT_TYPE, hostAllowed, root, server } from "./constants/constants.js";
import { seedTasks } from "./mockData/mockTasks.js";

const db: Database = new sqlite3.Database("./db/tasks.db");

db.exec(`CREATE TABLE IF NOT EXISTS Tasks(
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_title VARCHAR(100) NOT NULL,
        task_description VARCHAR(250) NOT NULL,
        task_status TEXT NOT NULL,
        task_priority TEXT NOT NULL,
        task_due_date DATE NOT NULL,
        task_creation_date DATE NOT NULL 
    )`, (err) => {
    if (err) console.log("Error while creating users table: ", err)
});

export const app = http.createServer((request: IncomingMessage, response: ServerResponse) => {
    response.setHeaders(new Headers(
        {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, QUERY",
            "Access-Control-Allow-Headers": "Content-Type"
        }))

    let url = new URL(request.url!, server);

    console.log(url.pathname);

    if (request.method === "OPTIONS") {
        response.statusCode = 204;
        response.end()
    }

    if (url.pathname === root && request.method === "GET") {
        handleQueryRequest(db, request, response);
        seedTasks(db);
    }

    if (url.pathname === root && request.method === "POST") {
        handlePostRequest(db, request, response)
    }

    if (url.pathname?.startsWith(root) && request.method === "DELETE") {
        handleDeleteRequest(db,request,response)
    }
    
    if (url.pathname === root && request.method === "PUT") {
        handlePutRequest(db,request,response)
    } 
    
});
