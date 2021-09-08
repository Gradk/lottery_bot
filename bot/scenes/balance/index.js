const Scene = require('telegraf/scenes/base')
const User = require("../../../models/User");
const {send} = require("../../modules");
const {SERVER_URL, YANDEX} = require("../../../configs/default");
const balance = new Scene('balance')
const deposit = new Scene('deposit')
const withdraw = new Scene('withdraw')
const checkWallet = new Scene('checkWallet')
const requestWallet = new Scene('requestWallet')
const requestAmount = new Scene('requestAmount')
const Payment = require('../../../models/Payments')
const {YMApi} = require("yoomoney-sdk");
const {sendPayment} = require("../../modules/payments/yandex");

balance.enter(async (ctx) => {
    const user = await User.findOne({id: ctx.from.id});
    const extra = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Пополнить баланс',
                    callback_data: `deposit`
                }, {
                    text: 'Вывести средства',
                    callback_data: `withdraw`
                }
                ],
            ]
        }
    }
    await ctx.replyWithHTML(`${user.first_name}
<b>Ваш баланс:</b> ${Math.round(user.balance)} руб.
`, extra)

})

balance.action(/deposit/, async ctx => {
    await ctx.scene.enter('deposit')
})

balance.action(/withdraw/, async ctx => {
    const user = await User.findOne({id: ctx.from.id});
    if (user.balance <= 0) {
        await ctx.scene.leave()
        return await send(ctx, 'На балансе нет средств для вывода')
    }
    await ctx.scene.enter('requestWallet')

})

requestWallet.enter(async ctx => {
    await send(ctx, 'Введите номер кошелька Яндекс деньги', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '<< отмена',
                    callback_data: `reset`
                }
                ],
            ]
        }
    })
})

requestWallet.action('reset', async ctx => {
    await ctx.deleteMessage()
    await ctx.scene.leave()
})

requestWallet.on('message', async ctx => {
    const number = ctx.message.text.match(/[0-9]{15}/gm)
    if (!number) return send(ctx, 'Введите корректный номер кошелька, без пробелов')
    await ctx.scene.enter('checkWallet', {number: number[0]})
})

checkWallet.enter(async ctx => {
    const {number} = ctx.scene.state
    await send(ctx, `Ваш кошелек: ${number} 
Продолжим?`, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Да',
                    callback_data: `number_accept`
                }, {
                    text: 'Нет',
                    callback_data: `number_decline`
                }
                ],
            ]
        }
    })
})

checkWallet.action('number_accept', async ctx => {
    const {number} = ctx.scene.state
    await ctx.scene.enter('requestAmount', {number})
})

checkWallet.action('number_decline', async ctx => {
    await ctx.deleteMessage()
    await ctx.scene.leave()
})

// withdraw.enter(async ctx => {
//     const {number} = ctx.scene.state
//     await send(ctx, number)
// })

requestAmount.enter(async ctx => {
    const user = await User.findOne({id: ctx.from.id});
    await send(ctx, `Ваш баланс: ${Math.round(user.balance)} руб.
Введите сумму для вывода`)
})

requestAmount.on('message', async ctx => {
    const {number} = ctx.scene.state;
    const amount = ctx.message.text;
    const user = await User.findOne({id: ctx.from.id});


    if (isNaN(amount) || amount > user.balance) return await send(ctx, 'Введите корректную сумму вывода, возможно она превышает баланс')
    //console.log(amount)
    const api = new YMApi(YANDEX.token)
    const {balance} = await api.accountInfo()

    if (balance < amount) return await send(ctx, 'Технические неполадки, попробуйте позже')

    const {message, success} = await sendPayment(number, amount)
    await ctx.reply(message)

    if (success) await User.findByIdAndUpdate(user._id, {$inc: {balance: amount * -1}})
    await ctx.scene.leave()
})

//депозит сцена
deposit.enter(async ctx => {
    await send(ctx, 'Введите сумму пополнения:', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '<< отмена',
                    callback_data: `reset`
                }
                ],
            ]
        }
    })
})

deposit.action('reset', async ctx => {
    await ctx.deleteMessage()
    await ctx.scene.leave()
})


deposit.on('message', async ctx => {
    const {text} = ctx.message
    console.log(typeof (text))
    if (isNaN(text) || +text < 2) return await send(ctx, 'Введите корректное число. \nМинимальное пополнение 2 руб.')
    const billId = Math.round(Math.random() * 99999999)
    const payUrl = `${SERVER_URL}/payment?amount=${text}&label=${ctx.from.id};${0};${text};${0};${billId}`
    await Payment.create({
        payment_id: billId,
        amount: text,
        create_date: Date.now(),
        user_id: ctx.from.id
    })
    await send(ctx, 'Ваша ссылка на оплату', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Оплатить картой банка или яндекс деньги',
                    url: payUrl
                }]
            ]
        }
    })
    await ctx.scene.leave()
})

module.exports = {balance, deposit, requestWallet, withdraw, checkWallet, requestAmount}