"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js")
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

//data: title, salary, equity, company_handle

describe("create", function () {
    const newJob = {
        title: "new",
        salary: 100,
        equity: 0.1,
        company_handle: "c1"
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual(
            {
                id: expect.any(Number),
                title: "new",
                salary: 100,
                equity: "0.1",
                company_handle: "c1"
            });
    });

    test("bad request with duplicate job", async function () {
        const dupJob = {
            title: "new",
            salary: 100,
            equity: 0.1,
            company_handle: "c1"
        };

        try {
            let job1 = await Job.create(newJob);
            let job2 = await Job.create(dupJob);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "t1",
                salary: 100,
                equity: "0.1",
                company_handle: "c1",
            },
            {
                id: expect.any(Number),
                title: "t2",
                salary: 300,
                equity: "0.1",
                company_handle: "c2",
            }
        ]);
    });
    test("works: filters by min salary", async function () {
        let jobs = await Job.findAll({ minSalary: 200 });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "t2",
                salary: 300,
                equity: "0.1",
                company_handle: "c2",
            }
        ]);
    });
    test("works: filters by equity - true", async function () {
        const newJob = await Job.create({
            title: "nope",
            salary: 100,
            company_handle: "c1"
        }) 
        let jobs = await Job.findAll({ hasEquity:true });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "t1",
                salary: 100,
                equity: "0.1",
                company_handle: "c1",
            },
            {
                id: expect.any(Number),
                title: "t2",
                salary: 300,
                equity: "0.1",
                company_handle: "c2",
            }
        ]);
    });
    test("works: filters by partial title, case insensitive", async function () {
        let jobs = await Job.findAll({ name: "t" });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "t1",
                salary: 100,
                equity: "0.1",
                company_handle: "c1",
            },
            {
                id: expect.any(Number),
                title: "t2",
                salary: 300,
                equity: "0.1",
                company_handle: "c2",
            }
        ]);
    });

    test("works: returns empty array if no results found", async function () {
        let jobs = await Job.findAll({ title: "not a title" });
        expect(jobs).toEqual([]);
    });
});

/************************************** get by id */

describe("get", function () {
    test("works", async function () {

        console.log(testJobIds)

        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0].id,
            title: "t1",
            salary: 100,
            equity: "0.1",
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: 'http://c1.img'
            },
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});