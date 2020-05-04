const knex = require('../services/knex');  // define database based on above

const insert = async (req, sidnum) => {
    return await knex.raw(
        "INSERT INTO Reprint (idnum, sidnum, likeit, tstamp) VALUES ((SELECT idnum FROM Identity WHERE handle = ? AND password = ?),?,?,?)", 
        [req.handle, req.password, sidnum, req.likeit, new Date().toISOString().slice(0, 19).replace('T', ' ')] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert
}