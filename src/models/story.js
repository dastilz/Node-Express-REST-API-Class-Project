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

const selectTimeline = async (req) => {
    return await knex.raw(
        "SELECT 'story' AS type, Identity1.fullname AS author, Story1.sidnum, Story1.chapter, Story1.tstamp AS posted FROM Story AS Story1 " +
            "INNER JOIN Identity AS Identity1 " + 
                "ON Story1.idnum = Identity1.idnum " +
            "INNER JOIN Identity AS Identity2 " +
                "ON Identity2.handle = ? AND Identity2.password = ?" +
            "INNER JOIN Follows AS Follows1 " +
                "ON Story1.idnum = Follows1.followed AND Follows1.follower = Identity2.idnum " +
            "WHERE Story1.tstamp >= ? AND Story1.tstamp <= ? " +
                "AND Identity2.idnum NOT IN (SELECT Block.blocked FROM Block WHERE Block.idnum = Follows1.followed)" +
        "UNION " +
        "SELECT 'reprint' AS type, Identity3.fullname AS author, Story2.sidnum, Story2.chapter, Reprint.tstamp AS posted FROM Reprint " +
            "INNER JOIN Story AS Story2 " +
                "ON Reprint.sidnum = Story2.sidnum " +
            "INNER JOIN Identity AS Identity3 " + 
                "ON Reprint.idnum = Identity3.idnum " +
            "INNER JOIN Identity AS Identity4 " +
                "ON Identity4.handle = ? AND Identity4.password = ?" +
            "INNER JOIN Follows AS Follows2 " +
                "ON Story2.idnum = Follows2.followed AND Follows2.follower = Identity4.idnum " + 
            "WHERE Story2.tstamp >= ? AND Story2.tstamp <= ? " +
                "AND Identity4.idnum NOT IN (SELECT Block.blocked FROM Block WHERE Block.idnum = Follows2.followed)",
        [req.handle, req.password, req.newest, req.oldest, req.handle, req.password, req.newest, req.oldest]
    )
}

module.exports = {
    insert, select, selectTimeline
}