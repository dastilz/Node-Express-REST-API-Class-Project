const knex = require('../services/knex');  // define database based on above

// Inserts a new story
const insert = async (req) => {
    return await knex.raw(
        "INSERT INTO Story (idnum, chapter, url, expires, tstamp) VALUES ((SELECT idnum FROM Identity WHERE handle = ? AND password = ?),?,?,?,?)", 
        [req.handle, req.password, req.chapter, req.url, req.expires, new Date().toISOString().slice(0, 19).replace('T', ' ')] 
    )
    .then((data) => data[0])
}

// Selects a story by ID
const select = async (sidnum) => {
    return await knex.raw(
        "SELECT * FROM Story WHERE sidnum = ?", 
        [sidnum] 
    )
    .then((data) => data[0])
}

// Selects a timeline of most recent stories and reprints
const selectTimeline = async (req) => {
    return await knex.raw(
        "SELECT 'story' AS type, Identity1.fullname AS author, Story1.sidnum, Story1.chapter, Story1.tstamp AS posted FROM Story AS Story1 " +
            "INNER JOIN Identity AS Identity1 " + 
                "ON Story1.idnum = Identity1.idnum " +
            "INNER JOIN Follows AS Follows1 " +
                "ON Story1.idnum = Follows1.followed AND Follows1.follower = (SELECT idnum FROM Identity WHERE handle = ? AND password = ?) " +
            "WHERE Story1.tstamp <= ? AND Story1.tstamp >= ? " +
                "AND (SELECT idnum FROM Identity WHERE handle = ? AND password = ?) NOT IN (SELECT Block.blocked FROM Block WHERE Block.idnum = Follows1.followed) " +
        "UNION " +
        "SELECT 'reprint' AS type, Identity2.fullname AS author, Story2.sidnum, Story2.chapter, Reprint.tstamp AS posted FROM Reprint " +
            "INNER JOIN Story AS Story2 " +
                "ON Reprint.sidnum = Story2.sidnum " +
            "INNER JOIN Identity AS Identity2 " + 
                "ON Reprint.idnum = Identity2.idnum " +
            "INNER JOIN Follows AS Follows2 " +
                "ON Reprint.idnum = Follows2.followed AND Follows2.follower = (SELECT idnum FROM Identity WHERE handle = ? AND password = ?) " + 
            "WHERE Story2.tstamp <= ? AND Story2.tstamp >= ? " +
                "AND (SELECT idnum FROM Identity WHERE handle = ? AND password = ?) NOT IN (SELECT Block.blocked FROM Block WHERE Block.idnum = Follows2.followed) " +
                "AND (SELECT idnum FROM Identity WHERE handle = ? AND password = ?) NOT IN (SELECT Block.blocked FROM Block WHERE Block.idnum = Story2.idnum)" +
            "ORDER BY posted DESC",
        [req.handle, req.password, req.newest, req.oldest, req.handle, req.password, req.handle, req.password, req.newest, req.oldest, req.handle, req.password, req.handle, req.password]
    )
}

module.exports = {
    insert, select, selectTimeline
}