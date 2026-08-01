import { Order } from "../../types/types.js";


export function returnOrder(order: Order) {
    let orderBy;
    let orderIn;

    if (order === "a-z" || order === "z-a") {
        orderBy = "task_title"
    }

    if (order === "earliestCreationDate" || order === "latestCreationDate") {
        orderBy = "task_creation_date"
    }

    if (order === "a-z") {
        orderIn = "ASC"
    }

    if (order === "z-a") {
        orderIn = "DESC"
    }

    if (order === "earliestCreationDate") {
        orderIn = "ASC"
    }

    if (order === "latestCreationDate") {
        orderIn = "DESC"
    }

    return [orderBy, orderIn]
}