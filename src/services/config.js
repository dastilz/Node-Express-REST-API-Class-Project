// Author: David Stilz

const config = {}

// Database config variables
config.host = 'localhost'
config.user = 'root'
config.password = 'password'
config.database = 'SMPDB'

// Server config
config.PORT = 9990

// SQL errors
config.SQL_CONSTRAINT_ERRORS = ['ER_DUP_ENTRY', 'ER_NO_REFERENCED_ROW', 'ER_NO_REFERENCED_ROW_2']

module.exports = config