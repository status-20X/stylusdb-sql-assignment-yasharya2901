// src/queryParser.js

function parseQuery(query) {
    query = query.trim();
    const whereSplit = query.split(/\sWHERE\s/i);

    const queryWithSelectJoin = whereSplit[0]
    // SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id = enrollment.student_id
    const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;
    // student.age > 20

    let whereClauseCondition = parseWhereClause(whereClause);

    let joinSplit = queryWithSelectJoin.split(/\s(INNER|LEFT|RIGHT) JOIN\s/i)
    let selectClause = joinSplit[0].trim()

    // let selectParsed = parseSelectClause(selectClause);
    const {fields, table} = parseSelectClause(selectClause)
    const {joinType, joinTable, joinCondition } = parseJoinClause(queryWithSelectJoin);
    
    return {
        fields: fields,
        table: table,
        whereClauses: whereClauseCondition,
        joinTable: joinTable,
        joinCondition: joinCondition,
        joinType: joinType
    }

}

function parseSelectClause(selectPart) {
    const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
    const selectMatch = selectPart.match(selectRegex);
    if (!selectMatch) {
        throw new Error('Invalid SELECT format');
    }

    const [, field, table] = selectMatch
    fields = field.split(',').map(field => field.trim())
    return {fields, table: table.trim()}

}

function parseQuery1(query) {

    // 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE student.age > 20'
    // First, let's trim the query to remove any leading/trailing whitespaces
    query = query.trim();

    // Initialize variables for different parts of the query
    let selectPart, fromPart;

    // Split the query at the WHERE clause if it exists
    const whereSplit = query.split(/\sWHERE\s/i);
    // ["SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id = enrollment.student_id", 
    // "student.age > 20"]

    query = whereSplit[0]; // Everything before WHERE clause
    // SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id = enrollment.student_id

    // WHERE clause is the second part after splitting, if it exists
    const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;
    // student.age > 20

    // Split the remaining query at the JOIN clause if it exists
    const joinSplit = query.split(/\s(INNER|LEFT|RIGHT) JOIN\s/i);
    selectPart = joinSplit[0].trim(); // Everything before JOIN clause

    // JOIN clause is the second part after splitting, if it exists
    const joinPart = joinSplit.length > 1 ? joinSplit[1].trim() : null;

    // Parse the SELECT part
    const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
    const selectMatch = selectPart.match(selectRegex);
    if (!selectMatch) {
        throw new Error('Invalid SELECT format');
    }

    const [, fields, table] = selectMatch;

    // Parse the JOIN part if it exists
    let joinTable = null, joinCondition = null;
    if (joinPart) {
        const joinRegex = /^(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
        const joinMatch = joinPart.match(joinRegex);
        if (!joinMatch) {
            throw new Error('Invalid JOIN format');
        }

        joinTable = joinMatch[1].trim();
        joinCondition = {
            left: joinMatch[2].trim(),
            right: joinMatch[3].trim()
        };
    }

    // Parse the WHERE part if it exists
    let whereClauses = [];
    if (whereClause) {
        whereClauses = parseWhereClause(whereClause);
    }

    return {
        fields: fields.split(',').map(field => field.trim()),
        table: table.trim(),
        whereClauses,
        joinTable,
        joinCondition
    };
}

// src/queryParser.js
function parseWhereClause(whereString) {
    if (whereString == null) {
        return [];
    }
    const conditionRegex = /(.*?)(=|!=|>|<|>=|<=)(.*)/;
    return whereString.split(/ AND | OR /i).map(conditionString => {
        const match = conditionString.match(conditionRegex);
        if (match) {
            const [, field, operator, value] = match;
            return { field: field.trim(), operator, value: value.trim() };
        }
        throw new Error('Invalid WHERE clause format');
    });
}

function parseJoinClause(query) {
    const joinRegex = /\s(INNER|LEFT|RIGHT) JOIN\s(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
    const joinMatch = query.match(joinRegex);

    if (joinMatch) {
        return {
            joinType: joinMatch[1].trim(),
            joinTable: joinMatch[2].trim(),
            joinCondition: {
                left: joinMatch[3].trim(),
                right: joinMatch[4].trim()
            }
        };
    }

    return {
        joinType: null,
        joinTable: null,
        joinCondition: null
    };
}

// const a = parseQuery('SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id = enrollment.student_id WHERE student.age > 20')
// console.log(a);

module.exports = { parseQuery, parseJoinClause };