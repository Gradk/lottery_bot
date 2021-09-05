const Scene = require('telegraf/scenes/base')
const User = require('../../../models/User');
const referals = new Scene('referals');
const {BOT_NAME} = require('../../../configs/default')

referals.enter(async (ctx)=>{
    ctx.replyWithHTML(`👉 Стань участником реферальной программы! 
    
 Получи реферальную ссылку и пригласи по ней друзей. 

💰 С каждой покупки стикера другом ты будешь получать 5%`)

const userID = ctx.from.id
ctx.reply(`🚀 Ваша ссылка для приглашений: \n\nhttp://t.me/${BOT_NAME}?start=${userID}`)

    
 })


module.exports = {referals}