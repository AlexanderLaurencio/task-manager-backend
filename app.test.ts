import request from "supertest";
import { app } from "./app.js";
import { describe, test } from "vitest";
import { getCurrentDate } from "./utils/date/date.js";


describe("Testing all the request handlers", () => {
    test("Should respond with a 200 status code, and json content type", () => {
        const response = request(app).
            post("/")
            .expect("Content-Type", /json/)
            .expect(200)
            .send({
                title: "Task title",
                description: "Not defined",
                status: "pending",
                priority: "medium",
                dueDate: "2036-07-25",
                creationDate: `${getCurrentDate()}`                
            })
            .end((err, res) => {

                if (err) {
                    console.log("Error while testing post /tasks endpoint",err)
                }

                console.log(res.body)
            });
    });

    test("Should respond with a 200 status code, and json content type", () => {
        const response = request(app)
        .get("/")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {

            if (err) {
                console.log("Error while testing get /tasks endpoint")
            }

            console.log(res.body)
        })      
    });

    test("Should respond with a 200 status code, and text content type", () => {
        const response = request(app)
        .delete("/1")
        .expect(200)
        .expect(/text/)
        .end((err, res) => {

            if (err) {
                console.log("Error while testing /tasks/:id endpoint");
            }

            console.log(res.body)
        })
    });
    
    test("Should repond with a 200 status code, and text content type", () => {
        const response = request(app)
        .put("/")
        .expect(200)
        .expect(/text/)
        .end((err, res) => {

            if (err) {
                console.log("Error while testing put request in /task/ endpoint ");
            }

            console.log(res.body)
        }) 
    })
});