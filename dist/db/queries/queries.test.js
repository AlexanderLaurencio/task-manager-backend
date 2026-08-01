import { expect, test, describe } from "vitest";
import sqlite3 from "sqlite3";
import { deleteTask, getAllTasks, getFilteredTasks, getStats, getTask, getTotalTasks, insertTask, updateTask } from "./queries.js";
import { seedTasks } from "../../mockData/mockTasks.js";
const db = new sqlite3.Database(":memory:");
db.exec(`CREATE TABLE IF NOT EXISTS Tasks(
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_title VARCHAR(100) NOT NULL,
        task_description VARCHAR(250),
        task_status TEXT NOT NULL,
        task_priority TEXT NOT NULL,
        task_due_date DATE NOT NULL,
        task_creation_date DATE NOT NULL 
    );`, (err) => {
    if (err)
        console.log("Error while creating users table: ", err);
});
describe("Testing all function in queries.ts", () => {
    test("getAll must return an array", async () => {
        try {
            const result = await getAllTasks(db);
            expect(Array.isArray(result)).toBeTruthy();
        }
        catch (error) {
            console.log("Error while testing getAll", error);
        }
    });
    test("insertTask must add a new task into the db, increasing its length", async () => {
        const task = { task_title: "Learn English", task_description: "Study English vocab.",
            task_status: "pending", task_priority: "high", task_due_date: "2026-08-01"
        };
        try {
            const rowsBeforeInserting = await getAllTasks(db);
            await insertTask(db, task);
            const rowsAfterInserting = await getAllTasks(db);
            expect(rowsBeforeInserting.length < rowsAfterInserting.length);
        }
        catch (error) {
            console.log("Error while testing insertTask", error);
        }
    });
    test("getStats should return an object with this structure", async () => {
        try {
            const statusStats = await getStats(db);
            expect(statusStats).toMatchObject({
                completed: expect.any(Number),
                inProgress: expect.any(Number),
                pending: expect.any(Number)
            });
        }
        catch (error) {
            console.log("Error while testing getStats", error);
        }
    });
    test("getTotalTasks should return a number", async () => {
        try {
            const totalTasks = await getTotalTasks(db);
            expect(totalTasks).toEqual(1);
        }
        catch (error) {
            console.log("Error while testing total tasks", error);
        }
    });
    test("deleteTask should delete a task", async () => {
        try {
            let rowsBeforeDeleting = await getAllTasks(db);
            await deleteTask(db, 1);
            let rowsAfterDeleting = await getAllTasks(db);
            expect(rowsBeforeDeleting.length > rowsAfterDeleting.length);
        }
        catch (error) {
            console.log("Error while testing deteteTask()");
        }
    });
    test("getTask() should return a task", async () => {
        try {
            let newTask = {
                task_title: "Go to the gym", task_description: "Not Defined",
                task_status: "pending", task_priority: "high", task_due_date: "2026-09-10"
            };
            await insertTask(db, newTask);
            let fetchedTask = await getTask(db, 2);
            expect(fetchedTask).toMatchObject(newTask);
        }
        catch (error) {
            console.log("Error while testing getTask()");
        }
    });
    test("updateTask() should update a task", async () => {
        try {
            let { task_id, task_title, task_description, task_status, task_priority, task_due_date } = {
                task_id: 2, task_title: "Go to the gym", task_description: "Not Defined",
                task_status: "pending", task_priority: "high", task_due_date: "2026-09-10"
            };
            await updateTask(db, task_id, task_title, task_description, task_status, task_priority, task_due_date);
            let updatedTask = await getTask(db, 2);
            expect(updateTask).toMatchObject({ task_id, task_title, task_status, task_priority, task_due_date });
        }
        catch (error) {
            console.log("Error while testing updateTask()");
        }
    });
    test("getSpecificTasks() should return an array with specific tasks", async () => {
        //Populating the database with more tasks
        await seedTasks(db);
        //All the tasks in specificTasks1 should have a status of pending
        let specificTasks1 = await getFilteredTasks(db, { pattern: null, filter: "pending", order: "a-z", page: 1 });
        expect(specificTasks1.every(t => t.task_status === "pending")).toBeTruthy();
        //All the the tasks in the specificTasks2 should have a status of inProgress and 
        //match their task_title should match /a/
        let specificTasks2 = await getFilteredTasks(db, { pattern: "a", filter: "inProgress", order: "a-z", page: 2 });
        expect(specificTasks2.every(t => t.task_status === 'inProgress' && t.task_title.includes("a"))).toBeTruthy();
        //SpecificTasks3 must contain 10 tasks
        let specificTasks3 = await getFilteredTasks(db, { pattern: null, filter: "all", order: "a-z", page: 1 });
        expect(specificTasks3.length).toBe(10);
    });
});
