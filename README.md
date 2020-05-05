# ABOUT
- Author: David Stilz
- Class: CS405
- Language/Framework Used: Node.js + Express.js + Knex.js (js stands for JavaScript)

## ENVIRONMENT (SUPPORTS CS.UKY.EDU VMs)
- Knowingly supports Node.js > v8.10.0
- Knowingly supports NPM > v3.5.2

## SETUP
- Create database with my SMP.sql script (Make sure to change privilege grantings)
- Run 'npm install' in terminal
- In /src/services/config.js, set username and password to appropriate mysql database username and password
- Run 'npm install' (don't worry about warnings, it should run even with warnings, at least it did on my VM)
- Run 'npm run server'

## DOCUMENTATION OF LIBRARIES/FRAMEWORKS/APIS
- Node.js: https://nodejs.org/en/docs/
- NPM: https://docs.npmjs.com/
- Node.js MySQL API (MariaDB & MySQL are API-compatible): https://www.npmjs.com/package/mysql
- Knex.js: https://knexjs.org/
- Express.js: https://expressjs.com/

## SAMPLE TESTING
- If you want to see how I tested, I have my API requests written in /test_requests.txt, you can simply copy and paste the entire file to run all requests
- However, you must go chronologically through the requests or things might not work as I intended
