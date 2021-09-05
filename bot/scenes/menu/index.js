const Scene = require('telegraf/scenes/base')

const menu = new Scene('menu')


menu.enter( async (ctx)=> {
  await ctx.reply("Меню", {
        reply_markup: {
            keyboard: [
                ["Комнаты", "Мой профиль", "Баланс","Статистика"],
                [ "Как это работает?"]
            ],
            resize_keyboard: true
        }
    })
})

menu.on('message', ctx => {
    const message = ctx.message.text
    switch(message){
        case "Комнаты" :
            ctx.reply('Выбрана комната')
            break
        case "Мой профиль" :
            ctx.scene.enter('profile')
            break 
        default: 
        ctx.reply('Команда не найдена')
        break
    }
})






module.exports = {menu}