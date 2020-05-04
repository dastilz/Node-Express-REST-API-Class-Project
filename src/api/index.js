// Import express library and router
const express = require('express');
const router = express.Router();

// Import config variables
const config = require('../services/config')

// Import DB models
const Identity = require('../models/identity')
const Follows = require('../models/follows')
const Block = require('../models/block')
const Story = require('../models/story')
const Reprint = require('../models/reprint')

// !!!! BEGIN EXAMPLE ENDPOINTS !!!! //

// Example 'exampleJSON' endpoint
router.post('/exampleJSON', (req, res) => {
    let exampleBody = req.body
    res.status(200).send(Object.assign({'status': '1'}, exampleBody))
})

// Example 'status' endpoint
router.get('/status', (req, res) => {
    res.status(200).send({'status': '1'})
})

// Example 'exampleGETBDATE' endpoint
router.get('/exampleGETBDATE/:idnum', async (req, res) => {
    try {
        let idnum = req.params.idnum
        let identity = await Identity.getBdateByIdnum(idnum)    
        if (identity != []) {
            let output = {}
            output.bdate = identity[0].bdate.toISOString().substring(0,10)    
            res.send(output)
        } else {
            res.send({})
        }

    } catch(err) {
        console.log(err.toString())
    }
})

// !!!! BEGIN NON-EXAMPLE ENDPOINTS !!!! //

// Helper function to authenticate a request with username and password
const authenticate = async (req) => {
    let identity = await Identity.selectByHandleAndPassword(req)
    return identity.length > 0
}

// Helper function to check if an account is blocked by another account
const checkBlocked = async (req, blockedId) => {
    let block = await Block.select(req, blockedId)
    return block.length > 0
}

// Helper function to loop through an array and see if a given string has a substring match in any of the items in the array
const checkSubstrings = (arr, str) => {
    for (item of arr) {
        if (str.includes(item)) {
            return true
        }
    }
    return false
}

// Helper function to handle outputting SQL constraints, missing parameters, unknown errors, etc
const handleError = async (err, res) => {
    errStr = err.toString()    
    // Print error to the console log for debugging
    console.log('INTERNAL SERVER ERROR:\n' + errStr)

    // Use helper function to see if error has a matching substring in list of possible constraint errors
    if (checkSubstrings(config.SQL_CONSTRAINT_ERRORS, errStr)) {
        res.send({'status': '-2', 'error': 'SQL Constraint Exception'})

    // Check for undefined parameters
    } else if (errStr.includes('Undefined binding(s)')) {        
        res.send({'status': '-2', 'error': 'Missing required request parameters'})

    // If no other specified error is found, output a '500' status with the full error string
    } else {
        res.send({'status': '500', 'error': errStr})
    }
}

// Endpoint for creating users, not protected by authentication
router.post('/createUser', async (req, res) => {
    try {
        // Get parameters from request
        let reqBody = req.body

        // Call Identity model to insert request into DB
        let identity = await Identity.insert(reqBody)
        let id = identity.insertId.toString()

        // Send response with inserted id as status
        res.status(200).send({"status": id})

    // Call helper function to handle catched errors
    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for viewing a user's information, protected by authentication
router.post('/seeUser/:idnum', async (req, res) => {
    try {
        // Get parameters from request
        let reqBody = req.body
        let idnum = req.params.idnum

        // Check for authentication
        if (await authenticate(reqBody)) {

            // Call Identity model to get select request from DB
            let identity = await Identity.select(reqBody, idnum)

            // If there is a selection, prepare the output
            if (identity.length > 0) {
                let output = Object.assign({'status': '1'}, identity[0])

                // Convert JavaScript Date to SQL compatible date
                output.bdate = output.bdate.toISOString().substring(0,10)   
                output.joined = output.joined.toISOString().substring(0,10)
                
                res.status(200).send(output)
            
            // If there are no selections, send empty object
            } else {
                res.send({})
            }
        
        // Send specified error if bad authentication
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    // Call helper function to handle catched errors
    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for offering suggestions based off of mutual followers
router.post('/suggestions', async (req, res) => {
    try {
        // Get parameters from request
        let reqBody = req.body

        // Check for authentication
        if (await authenticate(reqBody)) {  

            // Call Identity model to select suggestions
            let suggestions = await Identity.selectSuggestions(reqBody)  

            // Helper storage variables
            let output = {}
            let idnums = []
            let handles = []

            // Loop through suggestions and push contents to helper storage variables
            for (let i=0; i<suggestions.length; i++) {                    
                idnums.push(suggestions[i].idnum)
                handles.push(suggestions[i].handle)
            }

            // If there are selected suggestions, call join() to create a CSV line and set result as output attribute
            if (suggestions.length > 0) {
                output.status = suggestions.length.toString()
                output.idnums = idnums.join()
                output.handles = handles.join()
            
            // If there are no suggestions found, send specified error
            } else {
                output = {"status": "0", "error": "no suggestions"}
            }

            res.send(output)

        // Send specified error if bad authentication
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    // Call helper function to handle catched errors
    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for creating a story, protected by authentication
router.post('/poststory', async (req, res) => {
    try {
        // Get parameters from request
        let reqBody = req.body

        // Check for authentication
        if (await authenticate(reqBody)) {  

            // Set the expires field to null if not defined in request
            if (reqBody.expires == undefined) {
                reqBody.expires = null
            }

            // Call Story model to insert request into DB
            await Story.insert(reqBody) 
            res.send({'status': '1'})
            
        // Send specified error if bad authentication
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    // Call helper function to handle catched errors
    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for reprinting a story, protected by authentication
router.post('/reprint/:sidnum', async (req, res) => {
    try {
        // Get parameters from request
        let reqBody = req.body
        let sidnum = req.params.sidnum

        // Check for authentication
        if (await authenticate(reqBody)) {  

            // Call Story model to select story from database
            let story = await Story.select(sidnum)

            // If a story is found...
            if (story.length > 0) {

                // Check if the story that is being reprinted is blocked by the author
                if (!(blocked = await checkBlocked(reqBody, story[0].idnum))) {

                    // Set the likeit field to false if not defined in request
                    if (reqBody.likeit == undefined) {
                        reqBody.likeit = false
                    }

                    // Call the Reprint model to insert request into DB
                    await Reprint.insert(reqBody, sidnum)  
                    res.send({"status": "1"})

                // Output specified error
                } else {
                    res.send({"status": "0", "error": "blocked"})
                }

            // Output specified error
            } else {
                res.send({"status": "0", "error": "story not found"})
            }
        // Send specified error if bad authentication
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }
    // Call helper function to handle catched errors
    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for following another account, protected by authentication
router.post('/follow/:idnum', async (req, res) => {
    try {
        // Get parameters from request
        let idnum = req.params.idnum
        let reqBody = req.body

        // Check for authentication
        if (await authenticate(reqBody)) {  

            // Check if the account trying to follow is blocked by the account trying to be followed
            if (!(await checkBlocked(reqBody, idnum))) {

                // Call the Follows model to insert request into DB
                await Follows.insert(reqBody, idnum) 
                res.send({"status": "1"})
            
            // Output specified error
            } else {
                res.send({"status": "0", "error": "blocked"})
            }
        // Send specified error if bad authentication
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    // Call helper function to handle catched errors
    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for unfollowing another account, protected by authentication
router.post('/unfollow/:idnum', async (req, res) => {
    try {
        // Get parameters from request
        let idnum = req.params.idnum
        let reqBody = req.body

        // Check for authentication
        if (await authenticate(reqBody)) {  
            // Call Follows model to request delete to DB
            let deleteStatus = await Follows.del(reqBody, idnum)

            // Check if there has been a deletion
            if (deleteStatus.affectedRows > 0) {
                res.send({"status": "1"})
            
            // If there has been no deletions and no SQL errors to this point, this must mean there is nothing to unfollow
            } else {
                res.send({"status": "0", "error": "not currently followed"})
            }
        // Send specified error if bad authentication
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    // Call helper function to handle catched errors
    } catch(err) {
        res.send({'status': '-2'})
    }
})

// Endpoint for blocking another account, protected by authentication
router.post('/block/:idnum', async (req, res) => {
    try {
        // Get parameters from request
        let idnum = req.params.idnum
        let reqBody = req.body

        // Check for authentication
        if (await authenticate(reqBody)) { 

            // Call the Block model to insert request into DB 
            await Block.insert(reqBody, idnum)  
            res.send({"status": "1"})    

        // Send specified error if bad authentication
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    // Call helper function to handle catched errors
    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for unblocking another account, protected by authentication
router.post('/unblock/:idnum', async (req, res) => {
    try {
        // Get parameters from request
        let idnum = req.params.idnum
        let reqBody = req.body

        // Check for authentication
        if (await authenticate(reqBody)) { 

            // Call Block model to request delete to DB 
            let deleteStatus = await Block.del(reqBody, idnum)

            // Check if there has been a deletion
            if (deleteStatus.affectedRows > 0) {
                res.send({"status": "1"})

            // If there has been no deletions and no SQL errors to this point, this must mean there is nothing to unblock
            } else {
                res.send({"status": "0", "error": "not currently blocked"})
            }

        // Send specified error if bad authentication
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    // Call helper function to handle catched errors
    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for showing timeline of recently created stories and reprints of stories
router.post('/timeline', async (req, res) => {
    try {
        // Get parameters from request
        let reqBody = req.body

        // Check for authentication
        if (await authenticate(reqBody)) {  

            // Call Story model to select timeline
            let timeline = await Story.selectTimeline(reqBody)  

            // Helper variables
            let output = {}
            let count = 0

            // Check if timeline contents exist first, otherwise keep output an empty object
            if (timeline[0].length > 0) {

                // Loop through timeline contents and create specified output object
                for (item of timeline[0]) {

                    // Convert JavaScript date to SQL compatible timestamp
                    item.posted = item.posted.toISOString().slice(0, 19).replace('T', ' ')
                    output[count] = timeline[0][count] 
                    count++
                }
            }            

            // Stringify any object contents if they aren't strings already
            res.send(await JSON.stringify(output))

        // Send specified error if bad authentication
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    // Call helper function to handle catched errors
    } catch(err) {
        handleError(err, res)
    }
})

module.exports = router;