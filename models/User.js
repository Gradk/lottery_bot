const {Schema, model} = require('mongoose')


const GamesSchema = new Schema({
    wins: Number,
    looses: Number,
    total: Number,
})

const ReferalSchema = new Schema({
    referals: Array,
    referer: String,
    bonus: Number,
    procent_bonus: Number
})

const UserSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    buyed_tickets: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    last_activity: {
        type: String
    },
    register_date: {
        type: String,
        required: true
    },
    games: {
        type: GamesSchema,
        default: {
            wins: 0,
            looses: 0,
            total: 0,
        }
    },
    referal: {
        type: Object,
        default: {
            referals: [],
            referer: null,
            bonus: 0,
            procent_bonus: 5
        }
    }
})

const User = model('User', UserSchema)
module.exports = User