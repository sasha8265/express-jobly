const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("works: data", function () {
        const dataToUpdate = { val1: 'newVal1'};
        const jsToSql = { val1: 'val1', v2: 'val2' };
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql)
        expect(result).toEqual({
            setCols: "\"val1\"=$1",
            values: ["newVal1"]
        })
    })
})