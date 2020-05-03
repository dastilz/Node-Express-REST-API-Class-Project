const knex = require('../services/knex');  // define database based on above

const insert = async (req, idnum) => {
    return await knex.raw(
        "INSERT INTO Story (idnum, chapter, url, expires, tstamp) VALUES (?,?,?,?,?)", 
        [idnum, req.chapter, req.url, req.expires, new Date().toISOString().slice(0, 19).replace('T', ' ')] 
    )
    .then((data) => data[0])
}

const select = async (sidnum) => {
    return await knex.raw(
        "SELECT * FROM Story WHERE sidnum = ?", 
        [sidnum] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert, select
}