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

const select = async (req, idnum) => {
    return await knex.raw(
        "SELECT Identity1.fullname, Identity1.location, Identity1.email, Identity1.bdate, Identity1.joined FROM Identity AS Identity1 " +
            "INNER JOIN Identity AS Identity2 " +
                "ON Identity2.handle = ? AND Identity2.password = ? " +
            "WHERE Identity1.idnum = ? AND Identity2.idnum NOT IN (SELECT Block.blocked FROM Block WHERE Block.idnum = Identity1.idnum)",
        [req.handle, req.password, idnum]
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

const selectSuggestions = async (req) => {
    return await knex.raw(
        "SELECT Identity3.* FROM Identity AS Identity1 " +        
            "INNER JOIN Identity AS Identity2 " +
                "ON Identity2.handle = ? AND Identity2.password = ?" +
            "INNER JOIN Follows AS Follows1 " +
                "ON Identity1.idnum = Follows1.follower " +
            "INNER JOIN Follows AS Follows2 " +
                "ON Follows1.followed = Follows2.follower " +
            "INNER JOIN Identity AS Identity3 " +
                "ON Follows2.followed = Identity3.idnum " +
            "WHERE Identity1.idnum = Identity2.idnum AND NOT Follows2.followed = Identity2.idnum " +
                "AND Follows2.followed NOT IN (SELECT Follows3.followed FROM Follows AS Follows3 WHERE Follows3.follower = Identity2.idnum) LIMIT 4",
        [req.handle, req.password]
    )
    .then((data) => data[0])
}

module.exports = {
    getBdateByIdnum, insert, select, selectByHandleAndPassword, selectSuggestions
}