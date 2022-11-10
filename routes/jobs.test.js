"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {

    test("ok for admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                company_handle: "c1",
                title: "new",
                salary: 100,
                equity: "0.1"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "new",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1"
            }
        })
    });
    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new",
                salary: 100,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                company_handle: "c1",
                title: 1,
                salary: "100",
                equity: "0.1"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
})

/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        id: expect.any(Number),
                        company_handle: "c1",
                        title: "t1",
                        salary: 100,
                        equity: "0.1",
                    },
                    {
                        id: expect.any(Number),
                        company_handle: "c2",
                        title: "t2",
                        salary: 300,
                        equity: "0.1",
                    }
                ],
        });
    });

    test("works: filtering added", async function () {
        const resp = await request(app).get("/jobs").query({ minSalary: 150 });
        console.log(resp.body)
        expect(resp.body).toEqual({
            jobs:
                [{
                    id: expect.any(Number),
                    company_handle: "c2",
                    title: "t2",
                    salary: 300,
                    equity: "0.1",
                }],
        });

    });

    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE jobs CASCADE");
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    });
});