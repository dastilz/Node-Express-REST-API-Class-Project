// Author: David Stilz

const knex = require('../services/knex');  // define database based on above

// Gets a birth date by ID
const getBdateByIdnum = async (idnum) => {
    return await knex.raw("SELECT bdate FROM Identity WHERE idnum = ?", [idnum])
    .then((data) => data[0])
}

// Inserts a new identity
const insert = async (req) => {
    return await knex.raw(
        "INSERT INTO Identity (handle, password, fullname, location, email, bdate, joined) VALUES (?,?,?,?,?,?,?)", 
        [req.handle, req.password, req.fullname, req.location, req.xmail, req.bdate, new Date().toISOString().substring(0,10)] 
    )
    .then((data) => data[0])
}

// Selects an identity that isn't blocked
const select = async (requester, idnum) => {
    return await knex.raw(
        "SELECT Identity.handle, Identity.fullname, Identity.location, Identity.email, Identity.bdate, Identity.joined FROM Identity " +
            "WHERE Identity.idnum = ? AND ? NOT IN (SELECT Block.blocked FROM Block WHERE Block.idnum = Identity.idnum)",
        [idnum, requester]
    )
    .then((data) => data[0])
}

// Selects an identity by handle and password
const selectByHandleAndPassword = async (req) => {    
    return await knex.raw(
        "SELECT * FROM Identity WHERE handle = ? AND password = ?",
        [req.handle, req.password]
    )
    .then((data) => data[0])
}

// Selects suggestions of mutual followers, limited to four
const selectSuggestions = async (requester) => {
    return await knex.raw(
        "SELECT DISTINCT Identity2.* FROM Identity AS Identity1 " +        
            "INNER JOIN Follows AS Follows1 " +
                "ON Identity1.idnum = Follows1.follower " +
            "INNER JOIN Follows AS Follows2 " +
                "ON Follows1.followed = Follows2.follower " +
            "INNER JOIN Identity AS Identity2 " +
                "ON Follows2.followed = Identity2.idnum " +
            "WHERE Identity1.idnum = ? AND NOT Follows2.followed = ? " +
                "AND Follows2.followed NOT IN (SELECT Follows3.followed FROM Follows AS Follows3 WHERE Follows3.follower = ?) " +
                "AND ? NOT IN (SELECT Block.blocked FROM Block WHERE Block.idnum = Follows2.followed) LIMIT 4",
        [requester, requester, requester, requester]
    )
    .then((data) => data[0])
}

// Selects suggestions of all mutual followers
const selectAllSuggestions = async (requester) => {
    return await knex.raw(
        "SELECT DISTINCT Identity2.* FROM Identity AS Identity1 " +        
            "INNER JOIN Follows AS Follows1 " +
                "ON Identity1.idnum = Follows1.follower " +
            "INNER JOIN Follows AS Follows2 " +
                "ON Follows1.followed = Follows2.follower " +
            "INNER JOIN Identity AS Identity2 " +
                "ON Follows2.followed = Identity2.idnum " +
            "WHERE Identity1.idnum = ? AND NOT Follows2.followed = ? " +
                "AND Follows2.followed NOT IN (SELECT Follows3.followed FROM Follows AS Follows3 WHERE Follows3.follower = ?) " +
                "AND ? NOT IN (SELECT Block.blocked FROM Block WHERE Block.idnum = Follows2.followed)",
        [requester, requester, requester, requester]
    )
    .then((data) => data[0])
}

const selectBirthdays = async (requester) => {
    // Get dates server-side to make sure UTC dates are being used
    let currentDate = new Date()
    let futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    return await knex.raw(
        "SELECT Identity2.* FROM Identity AS Identity1 " +        
            "INNER JOIN Follows " +
                "ON Identity1.idnum = Follows.follower " +
            "INNER JOIN Identity AS Identity2 " +
                "ON Identity2.idnum = Follows.followed " +
            "WHERE Identity1.idnum = ? AND Identity2.bdate < ? AND Identity2.bdate > ?",
        [requester, futureDate.toISOString().substring(0,10), currentDate.toISOString().substring(0,10)]
    )
    .then((data) => data[0])
}

module.exports = {
    getBdateByIdnum, insert, select, selectByHandleAndPassword, selectSuggestions, selectAllSuggestions, selectBirthdays
}