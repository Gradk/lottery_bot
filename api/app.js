const express = require('express')
const app = express()
const routes = require('./routes') 
bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

routes(app) 


module.exports = async (PORT) => {
    await app.listen(PORT || 3000 )
    console.log('[info] server started')
}