const {greeter} = require('./game')
const {menu} = require('./menu')
const {profile} = require('./profile')
const {room, exactRoom} = require('./room')
const {help} = require('./help')
const {referals} = require('./referals')
const {game} = require('./game')
const {balance, deposit, requestWallet, withdraw, checkWallet, requestAmount} = require("./balance");


module.exports = (stage) => {
    stage.register(menu)
    stage.register(profile)
    stage.register(room)
    stage.register(exactRoom)
    stage.register(help)
    stage.register(referals)
    stage.register(game)
    stage.register(balance)
    stage.register(deposit)
    stage.register(requestWallet)
    stage.register(withdraw)
    stage.register(requestAmount)
    stage.register(checkWallet)


    return stage
}