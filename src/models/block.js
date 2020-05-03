const knex = require('../services/knex');  // define database based on above

const select = async (blockerId, blockedId) => {
    return await knex.raw(
        "SELECT * FROM Block WHERE idnum = ? AND blocked = ?", 
        [blockerId, blockedId]
    )
    .then((data) => data[0])
}

const insert = async (blockerId, blockedId) => {
    return await knex.raw(
        "INSERT INTO Block (idnum, blocked) VALUES (?,?)", 
        [blockerId, blockedId] 
    )
    .then((data) => data[0])
}

const del = async (blockerId, blockedId) => {
    return await knex.raw(
        "DELETE FROM Block WHERE idnum = ? AND blocked = ?", 
        [blockerId, blockedId] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert, del, select
}