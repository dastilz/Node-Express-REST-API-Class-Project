const knex = require('../services/knex');  // define database based on above

const insert = async (req, sidnum) => {
    return await knex.raw(
        "INSERT INTO Reprint (idnum, sidnum, likeit) VALUES ((SELECT idnum FROM Identity WHERE handle = ? AND password = ?),?,?)", 
        [req.handle, req.password, sidnum, req.likeit] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert
}