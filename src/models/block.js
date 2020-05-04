// Author: David Stilz

const knex = require('../services/knex');  // define database based on above

// Selects a matching blocked account relationship
const select = async (requester, blockedId) => {
    return await knex.raw(
        "SELECT * FROM Block WHERE idnum = ? AND blocked = ?", 
        [blockedId, requester]
    )
    .then((data) => data[0])
}

// Inserts a new blocked account relationship
const insert = async (requester, blockedId) => {
    return await knex.raw(
        "INSERT INTO Block (idnum, blocked) VALUES (?,?)", 
        [requester, blockedId] 
    )
    .then((data) => data[0])
}

// Deletes an existing blocked account relationship
const del = async (requester, blockedId) => {
    return await knex.raw(
        "DELETE FROM Block WHERE idnum = ? AND blocked = ?", 
        [requester, blockedId] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert, del, select
}