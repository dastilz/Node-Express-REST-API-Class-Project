const express = require('express');
const router = express.Router();

// DB models
const Identity = require('../models/Identity')

router.post('/exampleJSON', (req, res) => {
    res.status(200).send(Object.assign({'status': '1'}, req.body))
})

router.post('/status', (req, res) => {
    res.status(200).send({'status': '1'})
})

router.post('/exampleGETBDATE/:id', async(req, res) => {
    let bdate = await Identity.getBdateByIdnum(req.params.id)
    
    let output = {}
    output.bdate = bdate[0].bdate.toISOString().substring(0,10)

    res.status(200).send(output)
})

module.exports = router;