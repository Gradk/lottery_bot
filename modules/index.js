const mongoose = require('mongoose')
const {MONGO_URI} = require('../configs/default')


let mongoInit = async (token = MONGO_URI) => {
    try {
        const db = await mongoose.connect(token, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        console.log('[info] Mongo connect')
        return db
    } catch (e) {
        console.log('Server Error', e.message)
    }
}

module.exports = {mongoInit}