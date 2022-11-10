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
    adminToken,
    testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

console.log("TEST JOB IDs")
console.log(testJobIds)

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
        console.log(resp)
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        id: expect.any(Number),
                        companyHandle: "c1",
                        title: "t1",
                        salary: 100,
                        equity: "0.1",
                    },
                    {
                        id: expect.any(Number),
                        companyHandle: "c2",
                        title: "t2",
                        salary: 200,
                        equity: null,
                    },
                    {
                        id: expect.any(Number),
                        companyHandle: "c3",
                        title: "t3",
                        salary: 300,
                        equity: "0.5"
                    }
                ],
        });
    });

    test("works: filtering added", async function () {
        const resp = await request(app).get("/jobs").query({ minSalary: 150 });
        expect(resp.body).toEqual({
            jobs:
                [{
                    id: expect.any(Number),
                    companyHandle: "c2",
                    title: "t2",
                    salary: 200,
                    equity: null,
                },
                {
                    id: expect.any(Number),
                    companyHandle: "c3",
                    title: "t3",
                    salary: 300,
                    equity: "0.5"
                }
            ],
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


/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
        const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
        console.log(testJobIds[0])
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "t1",
                salary: 100,
                equity: "0.1",
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img"
                }
            },
        });
    });
    test("not found for no such job", async function () {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
    });
});


/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
    test("works for admin user", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                salary: 125,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                company_handle: "c1",
                title: "t1",
                salary: 125,
                equity: "0.1",
            },
        });
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                salary: 125,
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non Admin", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                salary: 125,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such job", async function () {
        const resp = await request(app)
            .patch(`/job/0`)
            .send({
                salary: 125,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on company_handle change attempt", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                company_handle: "c2",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid data", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                salary: "nope",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});