const knex = require('../services/knex');  // define database based on above

const getBdateByIdnum = async (idnum) => {
    return await knex.raw("SELECT bdate FROM Identity WHERE idnum = ?", [idnum])
    .then((data) => data[0])
}

const insert = async (req) => {
    return await knex.raw(
        "INSERT INTO Identity (handle, password, fullname, location, email, bdate, joined) VALUES (?,?,?,?,?,?,?)", 
        [req.handle, req.password, req.fullname, req.location, req.xmail, req.bdate, new Date().toISOString().substring(0,10)] 
    )
    .then((data) => data[0])
}

const select = async (idnum) => {
    return await knex.raw(
        "SELECT handle, fullname, location, email, bdate, joined FROM Identity WHERE idnum = ?",
        [idnum]
    )
    .then((data) => data[0])
}

const selectByHandleAndPassword = async (req) => {    
    return await knex.raw(
        "SELECT * FROM Identity WHERE handle = ? AND password = ?",
        [req.handle, req.password]
    )
    .then((data) => data[0])
}

module.exports = {
    getBdateByIdnum, insert, select, selectByHandleAndPassword
}