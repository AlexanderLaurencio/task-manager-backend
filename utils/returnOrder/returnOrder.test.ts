import { expect, describe, test} from "vitest";
import { returnOrder } from "./returnOrder.js";

describe("Testing chooseOrder()", () => {
    test("returnOrder() should return ['task_title, 'ASC']", () => {
        expect(returnOrder("a-z")).toEqual(["task_title","ASC"])
    });

    test("returnOrder() should return ['task_title','DESC']", () => {
        expect(returnOrder("z-a")).toEqual(["task_title","DESC"])
    });

    test("returnOrder() should return ['task_creation_date','ASC']", () => {
        expect(returnOrder("earliestCreationDate")).toEqual(["task_creation_date","ASC"])
    });

    test("returnORder should return ['task_creation_date','DESC']", () => {
        expect(returnOrder("latestCreationDate")).toEqual(["task_creation_date","DESC"])
    })

});