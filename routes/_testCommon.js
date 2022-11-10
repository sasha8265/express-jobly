"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");
const Job = require("../models/job.js");

const testJobIds = [];

async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM companies");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM jobs");


    await Company.create(
        {
            handle: "c1",
            name: "C1",
            numEmployees: 1,
            description: "Desc1",
            logoUrl: "http://c1.img",
        });
    await Company.create(
        {
            handle: "c2",
            name: "C2",
            numEmployees: 2,
            description: "Desc2",
            logoUrl: "http://c2.img",
        });
    await Company.create(
        {
            handle: "c3",
            name: "C3",
            numEmployees: 3,
            description: "Desc3",
            logoUrl: "http://c3.img",
        });

    await User.register({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        password: "password1",
        isAdmin: false,
    });
    await User.register({
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        password: "password2",
        isAdmin: false,
    });
    await User.register({
        username: "u3",
        firstName: "U3F",
        lastName: "U3L",
        email: "user3@user.com",
        password: "password3",
        isAdmin: false,
    });

    let testJob1 = await Job.create({
        company_handle: "c1",
        title: "t1",
        salary: 100,
        equity: "0.1"
    });
    let testJob2 = await Job.create({
        company_handle: "c2",
        title: "t2",
        salary: 200
    });
    let testJob3 = await Job.create({
        company_handle: "c3",
        title: "t3",
        salary: 300,
        equity: "0.5"
    });

    testJobIds.push(testJob1.id, testJob2.id, testJob3.id)
    console.log(testJobIds)
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken, 
    testJobIds
};
