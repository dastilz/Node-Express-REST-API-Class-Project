const knex = require('../services/knex');  // define database based on above

const insert = async (followerId, followedId) => {
    return await knex.raw(
        "INSERT INTO Follows (follower, followed, tstamp) VALUES (?,?,?)", 
        [followerId, followedId, new Date().toISOString().slice(0, 19).replace('T', ' ')] 
    )
    .then((data) => data[0])
}

const del = async (followerId, followedId) => {
    return await knex.raw(
        "DELETE FROM Follows WHERE follower = ? AND followed = ?", 
        [followerId, followedId] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert, del
}