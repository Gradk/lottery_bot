const {Telegraf} = require('telegraf');
const {BOT_TOKEN} = require('../configs/default');
const moment = require('moment')
const {checkReferals} = require('./modules/referals')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const scenesInit = require('./scenes');
const User = require('../models/User');

const clearCalls = async () => {
    let lastUpdates = await bot.telegram.callApi(
        'getUpdates',
        {offset: -1},
    ).catch(() => []);
    if (lastUpdates.length) {
        await bot.telegram.callApi(
            'getUpdates',
            {offset: lastUpdates[0].update_id + 1},
        ).catch();
    }
}


const bot = new Telegraf(BOT_TOKEN)
bot.use(session())
const stage = new Stage()
scenesInit(stage);
bot.use(stage.middleware())
//мидлвеар 
bot.use(async (ctx, next) => {
    if(ctx.from){
        const {id, first_name, last_name, username} = ctx.from
        const user = await User.findOne({id})




    if (!ctx.from.username) {
        await ctx.reply('❗️Заполните ник телеграмма, это необходимо для корректных выплат, Телеграм -> Настройки -> Изменить -> Имя пользователя')
        return
    }
    if (!user) {
        let date = moment().format('DD.MM.YYYY')
        const newUser = new User({id, first_name, last_name, username, register_date: date})
        await newUser.save()
    }}
    return next()

})

bot.command('/help', (ctx) => {
    ctx.scene.enter('help')
});


bot.start(async (ctx) => {
    const startText = '🤘 Привет, я бот стикеров. \n\n💣 Покупай стикеры и выигрывай 200, 300, 2000 руб. Сумма зависит от количества участников, бот лишь берет комиссию. \n\n❗️Розыгыш ежедневно в 13:00, выплаты моментальные на Яндекс кошелек.❗️ \n\n🗝 В каждой комнате стикеры по разным ценам, выбери подходящую и купи стикер'
    await ctx.reply(startText, {
        reply_markup: {
            keyboard: [
                ["Комнаты", "Мой профиль", "Баланс"],
                ["Как это работает?", "Бонусы"]
            ],
            resize_keyboard: true
        }
    })
    await ctx.reply('👉 Нажми в меню: "Комнаты"')
    //для тестов пополняем баланс
    // id = ctx.from.id
    // const updateBalance = await User.findOneAndUpdate(id, {
    //     balance: 100
    // })

    await checkReferals(ctx)


})

bot.on('message', ctx => {
    const message = ctx.message.text
    switch (message) {
        case "Комнаты" :
            ctx.scene.enter('room')
            break
        case "Мой профиль" :
            ctx.scene.enter('profile')
            break
        case "Как это работает?" :
            ctx.scene.enter('help')
            break
        case "Бонусы" :
            ctx.scene.enter('referals')
            break
        case "Баланс" :
            ctx.scene.enter('balance')
            break
        default:
            ctx.reply('Команда не найдена')
            break
    }
})


module.exports = async () => {
    await clearCalls()
    await bot.launch()
    console.log('Bot started')
    return bot
} 

