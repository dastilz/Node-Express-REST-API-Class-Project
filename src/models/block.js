const knex = require('../services/knex');  // define database based on above

// Selects a matching blocked account relationship
const select = async (req, blockedId) => {
    return await knex.raw(
        "SELECT * FROM Block WHERE idnum = ? AND blocked = (SELECT idnum FROM Identity WHERE handle = ? AND password = ?)", 
        [blockedId, req.handle, req.password]
    )
    .then((data) => data[0])
}

// Inserts a new blocked account relationship
const insert = async (req, blockedId) => {
    return await knex.raw(
        "INSERT INTO Block (idnum, blocked) VALUES ((SELECT idnum FROM Identity WHERE handle = ? AND password = ?),?)", 
        [req.handle, req.password, blockedId] 
    )
    .then((data) => data[0])
}

// Deletes an existing blocked account relationship
const del = async (req, blockedId) => {
    return await knex.raw(
        "DELETE FROM Block WHERE idnum = (SELECT idnum FROM Identity WHERE handle = ? AND password = ?) AND blocked = ?", 
        [req.handle, req.password, blockedId] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert, del, select
}