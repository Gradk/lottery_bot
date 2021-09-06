const https = require( "https" );
const fs = require( "fs" );
const express = require('express')
const app = express()
const routes = require('./routes') 
bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

routes(app)

httpsOptions = {
    key: fs.readFileSync(__dirname +"/api/private.key"), // путь к ключу
    cert: fs.readFileSync(__dirname +"/api/public.key") // путь к сертификату
}



module.exports = async (PORT) => {
    //await app.listen(PORT || 3000 )
    https.createServer(httpsOptions, app).listen(PORT || 3000);
    console.log('[info] server started')
}