const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("works: update 1 item", function () {
        const dataToUpdate = { val1: 'newVal1'};
        const jsToSql = { val1: 'val1', val2: 'val2' };
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql)
        expect(result).toEqual({
            setCols: "\"val1\"=$1",
            values: ["newVal1"]
        })
    })

    test("works: update 2 items", function () {
        const dataToUpdate = { val1: 'newVal1', val2: 'newVal2' };
        const jsToSql = { val1: 'val1' };
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql)
        console.log(result)
        expect(result).toEqual({
            setCols: "\"val1\"=$1, \"val2\"=$2",
            values: ["newVal1", "newVal2"]
        })
    })
})