// Author: David Stilz

const knex = require('../services/knex');  // define database based on above

// Inserts a new reprint
const insert = async (requester, req, sidnum) => {
    return await knex.raw(
        "INSERT INTO Reprint (idnum, sidnum, likeit, tstamp) VALUES (?,?,?,?)", 
        [requester, sidnum, req.likeit, new Date().toISOString().slice(0, 19).replace('T', ' ')] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert
}