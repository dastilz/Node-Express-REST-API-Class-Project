// Author: David Stilz

const knex = require('../services/knex');  // define database based on above

// Inserts a new followed account relationship
const insert = async (requester, followedId) => {
    return await knex.raw(
        "INSERT INTO Follows (follower, followed, tstamp) VALUES (?,?,?)", 
        [requester, followedId, new Date().toISOString().slice(0, 19).replace('T', ' ')] 
    )
    .then((data) => data[0])
}

// Deletes an existing followed account relationship
const del = async (requester, followedId) => {
    return await knex.raw(
        "DELETE FROM Follows WHERE follower = ? AND followed = ?", 
        [requester, followedId] 
    )
    .then((data) => data[0])
}

module.exports = {
    insert, del
}