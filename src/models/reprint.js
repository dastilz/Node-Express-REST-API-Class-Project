const knex = require('../services/knex');  // define database based on above

const insert = async (req, idnum, sidnum) => {
    return await knex.raw(
        "INSERT INTO Reprint (idnum, sidnum, likeit) VALUES (?,?,?)", 
        [idnum, sidnum, req.likeit] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert
}