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


    /** Find all jobs.
     * Filter by optional params: min-salary, has equity, title (case-insensitive and partial matches)
     * Returns [{ id, title, salary, equity, company_handle }, ...]
     * */

    static async findAll(filters = {}) {
        let whereExpressions = [];
        let queryVals = [];
        const { title, minSalary, hasEquity } = filters;

        let query = `SELECT id,
            title,
            salary,
            equity,
            company_handle
            FROM jobs`


        //Check for each possible param and add values to queryVals and value position to whereExpressions 
        if (minSalary !== undefined) {
            queryVals.push(minSalary);
            whereExpressions.push(`salary >= $${queryVals.length}`)
        }

        if (hasEquity === true) {
            whereExpressions.push(`equity > 0`);
        } 

        if (title !== undefined) {
            queryVals.push(`%${title}%`);
            whereExpressions.push(`title ILIKE $${queryVals.length}`)
        }

        //join whereExpressions and add new WHERE expression string to query
        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        }

        // finish assembling query
        query += " ORDER BY title"

        const jobsRes = await db.query(query, queryVals);
        return jobsRes.rows;
    }

    /** Given a job id, return data about job.
     *
     * Returns { title, salary, equity, company_handle }
     *
     * Throws NotFoundError if not found.
     **/

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
            title,
            salary,
            equity,
            company_handle
            FROM jobs
           WHERE id = $1`,
            [id]);
        
        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job found: ${id}`);

        const companyRes = await db.query(
            `SELECT handle,
            name,
            description,
            num_employees as "numEmployees",
            logo_url AS "logoUrl"
            FROM companies
            WHERE handle = $1`, [job.company_handle]);
        
        delete job.company_handle;
        job.company = companyRes.rows[0];
        return job;
    }

    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {title, salary, equity}
     *
     * Returns {id, title, salary, equity, company: {
     * handle, name, description, num_employees, logo_url}}
     *
     * Throws NotFoundError if not found.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id,
                        title,
                        salary,
                        equity,
                        company_handle`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }
}

module.exports = Job;