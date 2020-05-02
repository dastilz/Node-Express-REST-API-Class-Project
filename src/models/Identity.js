const knex = require('../services/knex');  // define database based on above

//-------------------- SELECT - DB --------------------//

const getBdateByIdnum = async (id) => {
    return await knex.raw("SELECT bdate FROM Identity WHERE idnum = ?", [id])
        .then((data) => data[0])
}

module.exports = {
    getBdateByIdnum
}