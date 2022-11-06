"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const Job = require("./job.js")
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
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
        equity: 1.0,
        company_handle: "c1"
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual(newJob);

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
        expect(result.rows).toEqual([
            {
                id: 1,
                title: "new",
                salary: 100,
                equity: 1.0,
                company_handle: "c1"
            },
        ]);
    });

    // test("bad request with dupe", async function () {
    //     try {
    //         await Company.create(newCompany);
    //         await Company.create(newCompany);
    //         fail();
    //     } catch (err) {
    //         expect(err instanceof BadRequestError).toBeTruthy();
    //     }
    // });
});