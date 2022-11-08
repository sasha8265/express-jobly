"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, company_handle }
     *
     * Returns { id, title, salary, equity, company_handle }
     *
     * Throws BadRequestError if company already in database.
     * */

    static async create({ title, salary, equity, company_handle }) {
        const duplicateCheck = await db.query(
            `SELECT title, company_handle
           FROM jobs
           WHERE title = $1 AND company_handle = $2`,
            [title, company_handle]);

        if (duplicateCheck.rows[0])
            throw new BadRequestError(`Duplicate job: ${title} at ${company_handle}`);

        const result = await db.query(
            `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
            [title, salary, equity, company_handle],
        );
        const job = result.rows[0];

        return job;
    }

    static async findAll(filters = {}) {
        let whereExpressions = [];
        let queryVals = [];
        const { title, minSalary, hasEquity } = filters;

        let query = `SELECT title,
            salary,
            equity,
            company_handle
            FROM companies`


        //Check for each possible param and add values to queryVals and value position to whereExpressions 
        if (minSalary !== undefined) {
            queryVals.push(minSalary);
            whereExpressions.push(`salary >= $${queryVals.length}`)
        }

        if (hasEquity !== undefined) {
            queryVals.push(hasEquity);
            whereExpressions.push(`equity >= $${queryVals.length}`)
        } 

        if (title !== undefined) {
            queryVals.push(`%${title}%`);
            whereExpressions.push(`name ILIKE $${queryVals.length}`)
        }

        //join whereExpressions and add new WHERE expression string to query
        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        }

        const jobsRes = await db.query(query, queryVals);
        return jobsRes.rows;
    }
}

module.exports = Job;