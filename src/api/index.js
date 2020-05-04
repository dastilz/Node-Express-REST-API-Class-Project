// Import express library and router
const express = require('express');
const router = express.Router();

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
router.post('/status', (req, res) => {
    res.status(200).send({'status': '1'})
})

// Example 'exampleGETBDATE' endpoint
router.post('/exampleGETBDATE/:idnum', async (req, res) => {
    try {
        let idnum = req.params.idnum
        let dbRes = await Identity.getBdateByIdnum(idnum)    
        if (dbRes != []) {
            let output = {}
            output.bdate = dbRes.bdate.toISOString().substring(0,10)    
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

const checkBlocked = async (req, blockedId) => {
    let block = await Block.select(req, blockedId)
    return block.length > 0
}

const handleError = async (err, res) => {
    errStr = err.toString()    
    console.log(errStr)

    if (errStr.includes('ER_DUP_ENTRY')) {
        res.send({'status': '-2', 'error': 'SQL Contraint Exception'})
    } else if (errStr.includes('Undefined binding(s)')) {        
        res.send({'status': '-2', 'error': 'Missing required request parameters'})
    } else {
        res.send({'status': '404', 'error': errStr})
    }
}

// Endpoint for creating users, not protected by authentication
router.post('/createUser', async (req, res) => {
    try {
        let identity = await Identity.insert(req.body)
        let id = identity.insertId.toString()
        res.status(200).send({"status": id})

    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for viewing a user's information, protected by authentication
router.post('/seeUser/:idnum', async (req, res) => {
    try {
        let reqBody = req.body
        let idnum = req.params.idnum

        if (await authenticate(reqBody)) {
            let identity = await Identity.select(reqBody, idnum)

            if (identity.length > 0) {
                let output = Object.assign({'status': '1'}, identity[0])
                output.bdate = output.bdate.toISOString().substring(0,10)   
                output.joined = output.joined.toISOString().substring(0,10)
                
                res.status(200).send(output)
            } else {
                res.send({})
            }
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for offering suggestions based off of mutual followers
router.post('/suggestions', async (req, res) => {
    try {
        let reqBody = req.body

        if (await authenticate(reqBody)) {  
            let suggestions = await Identity.selectSuggestions(reqBody)  
            let output = {}
            let idnums = []
            let handles = []

            for (let i=0; i<suggestions.length; i++) {                    
                idnums.push(suggestions[i].idnum)
                handles.push(suggestions[i].handle)
            }

            if (suggestions.length > 0) {
                output.status = suggestions.length.toString()
                output.idnums = idnums.join()
                output.handles = handles.join()
            } else {
                output = {"status": "0", "error": "no suggestions"}
            }

            res.send(output)
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }
    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for creating a story, protected by authentication
router.post('/poststory', async (req, res) => {
    try {
        let reqBody = req.body

        if (await authenticate(reqBody)) {  
            if (reqBody.expires == undefined) {
                reqBody.expires = null
            }
            await Story.insert(reqBody) 
            res.send({'status': '1'})
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    } catch(err) {
        handleError(err, res)
    }
})

// Endpoint for creating a story, protected by authentication
router.post('/reprint/:sidnum', async (req, res) => {
    try {
        let reqBody = req.body
        let sidnum = req.params.sidnum

        if (await authenticate(reqBody)) {  
            let story = await Story.select(sidnum)
            if (story.length > 0) {
                if (!(blocked = await checkBlocked(reqBody, story[0].idnum))) {
                    if (reqBody.likeit == undefined) {
                        reqBody.likeit = false
                    }
                    await Reprint.insert(reqBody, sidnum)  
                    res.send({"status": "1"})
                } else {
                    res.send({"status": "0", "error": "blocked"})
                }
            } else {
                res.send({"status": "0", "error": "story not found"})
            }
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }
    } catch(err) {
        console.log(err.toString())
        res.send({'status': '-2'})
    }
})

// Endpoint for following another account, protected by authentication
router.post('/follow/:idnum', async (req, res) => {
    try {
        let idnum = req.params.idnum
        let reqBody = req.body

        if (await authenticate(reqBody)) {  
            if (!(await checkBlocked(reqBody, idnum))) {
                await Follows.insert(reqBody, idnum) 
                res.send({"status": "1"})
            } else {
                res.send({"status": "0", "error": "blocked"})
            }
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    } catch(err) {
        console.log(err.toString())
        res.send({'status': '-2'})
    }
})

// Endpoint for unfollowing another account, protected by authentication
router.post('/unfollow/:idnum', async (req, res) => {
    try {
        let idnum = req.params.idnum
        let reqBody = req.body

        if (await authenticate(reqBody)) {  
            let deleteStatus = await Follows.del(reqBody, idnum)
            if (deleteStatus.affectedRows > 0) {
                res.send({"status": "1"})
            } else {
                res.send({"status": "0", "error": "not currently followed"})
            }
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    } catch(err) {
        console.log(err.toString())
        res.send({'status': '-2'})
    }
})

// Endpoint for blocking another account, protected by authentication
router.post('/block/:idnum', async (req, res) => {
    try {
        let idnum = req.params.idnum
        let reqBody = req.body

        if (await authenticate(reqBody)) {  

            if (blocker.length > 0 && blocked.length > 0) {
                await Block.insert(reqBody, idnum) 
                res.send({"status": "1"})
    
            } else {
                res.send({"status": "0", "error": "DNE"})
            }
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    } catch(err) {
        console.log(err.toString())
        res.send({'status': '-2'})
    }
})

// Endpoint for unblocking another account, protected by authentication
router.post('/unblock/:idnum', async (req, res) => {
    try {
        let idnum = req.params.idnum
        let reqBody = req.body

        if (await authenticate(reqBody)) {  
            let deleteStatus = await Block.del(reqBody, idnum)
            if (deleteStatus.affectedRows > 0) {
                res.send({"status": "1"})
            } else {
                res.send({"status": "0", "error": "not currently blocked"})
            }
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }

    } catch(err) {
        console.log(err.toString())
        res.send({'status': '-2'})
    }
})

// Endpoint for offering a  based off of mutual followers
router.post('/timeline', async (req, res) => {
    try {
        let reqBody = req.body

        if (await authenticate(reqBody)) {  
            let timeline = await Story.selectTimeline(reqBody)  
            res.send(timeline[0])
        } else {            
            res.send({'status': '-10', 'error': 'Invalid credentials'})
        }
    } catch(err) {
        console.log(err.toString())
        res.send({'status': '-2'})
    }
})

module.exports = router;