const knex = require('../services/knex');  // define database based on above

const insert = async (req, followedId) => {
    return await knex.raw(
        "INSERT INTO Follows (follower, followed, tstamp) VALUES ((SELECT idnum FROM Identity WHERE handle = ? AND password = ?),?,?)", 
        [req.handle, req.password, followedId, new Date().toISOString().slice(0, 19).replace('T', ' ')] 
    )
    .then((data) => data[0])
}

const del = async (req, followedId) => {
    return await knex.raw(
        "DELETE FROM Follows WHERE follower = (SELECT idnum FROM Identity WHERE handle = ? AND password = ?) AND followed = ?", 
        [req.handle, req.password, followedId] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert, del
}