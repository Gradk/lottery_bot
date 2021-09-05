const Scene = require('telegraf/scenes/base')
const Room = require('../../../models/Room');
const User = require('../../../models/User');
const Payments = require('../../../models/Payments');
const {send, getDate} = require('../../modules')
const {qiwiCreateBill, qiwiApi} = require('../../modules/payments/qiwi')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const {SERVER_URL} = require('../../../configs/default')


const room = new Scene('room')
const exactRoom = new Scene('exactRoom')


room.enter(async (ctx) => {
    const rooms = await Room.find()
    const keyboard = [
        []
    ]
    rooms.map(room => {
        let count_lines = keyboard.length
        if (keyboard[count_lines - 1].length == 2) {
            keyboard.push([{
                text: `Комната за ${room.price} руб.`,
                callback_data: `room_${room._id}`
            }])
        } else {
            keyboard[count_lines - 1].push({
                text: `Комната за ${room.price} руб.`,
                callback_data: `room_${room._id}`
            })
        }
    })
    await ctx.reply('Выберите комнату:', {
        reply_markup: {
            inline_keyboard: keyboard
        }
    })


})


room.action(/room_(?<ID>.+)/, async ctx => {
    const room_id = ctx.match[1];
    await ctx.scene.enter("exactRoom", {
        room_id
    })

})


exactRoom.enter(async (ctx) => {
    const {
        room_id
    } = ctx.scene.state

    let room = await Room.findById(room_id)

    let numberKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: '1',
                    callback_data: `buy_${room._id}_1`
                }, {
                    text: '2',
                    callback_data: `buy_${room._id}_2`
                }, {
                    text: '3',
                    callback_data: `buy_${room._id}_3`
                }],
                [{
                    text: '4',
                    callback_data: `buy_${room._id}_4`
                }, {
                    text: '5',
                    callback_data: `buy_${room._id}_5`
                }, {
                    text: '6',
                    callback_data: `buy_${room._id}_6`
                }],
                [{
                    text: '7',
                    callback_data: `buy_${room._id}_7`
                }, {
                    text: '8',
                    callback_data: `buy_${room._id}_8`
                }, {
                    text: '9',
                    callback_data: `buy_${room._id}_9`
                }],
                [{
                    text: '10',
                    callback_data: `buy_${room._id}_10`
                }]
            ]
        }
    }

    await send(ctx, `Цена комнаты: ${room.price} руб. \nКоличество участников: ${room.participants.length} 
Выберите количество стикеров:`, numberKeyboard)

    //необходимо списывать с баланса

    exactRoom.action(/buy_(?<ROOM_ID>.+)_(?<COUNT>.+)/, async ctx => {

        let count = ctx.match.groups.COUNT
        let exact_room = await Room.findById(ctx.match.groups.ROOM_ID)


        let sum = exact_room.price * count

        //Проверка баланса, если не хватает то рекомендует пополнить на недостующую сумму баланс
        const checkBalance = async (sum) => {
            //получаем баланс из бд
            let id = ctx.from.id
            let user = await User.findOne({id});
            let balance = Math.round(user.balance)

            if (balance >= sum) {
                let result = balance - sum
                //записываем в бд остаток
                //Купленные стикеры записать в бд
                await User.findOneAndUpdate({id: id}, {
                    balance: result,
                    buyed_tickets: user.buyed_tickets + +count
                })

                const room = await Room.findById(exact_room._id)
                const participantIndex = room.participants.findIndex(item => item.id === user.id)
                if (participantIndex >= 0) {
                    await Room.findByIdAndUpdate(exact_room._id, {$inc: {[`participants.${participantIndex}.tickets`]: Number(count)}})
                } else {
                    await Room.findByIdAndUpdate(exact_room._id, {
                        $push: {
                            participants: {
                                id: +user.id,
                                tickets: +count,
                                username: user.username,
                            }
                        }
                    })
                }

                await send(ctx, `Куплено стикеров: ${count}, \nОстаток на балансе: ${result} руб.`)

                return

            } else {
                let lacks = Math.round(balance - sum) * -1


                //проверить счета у этого юзера в пейментс модели, 
                const payments = await Payments.find({user_id: id, status: 'WAITING'})
                if (payments.length >= 1) {

                    //если есть то отменить записи со статусом...ожидание 
                    for (let index = 0; index < payments.length; index++) {
                        const billId = payments[index].payment_id
                        // await qiwiApi.cancelBill(billId)
                        //удалить запись из бд
                        await Payments.deleteOne({_id: payments[index]._id})
                    }

                }
                //генерация счета на оплату
                // const {payUrl, billId} = await qiwiCreateBill(lacks, ctx.from.id, room_id, count, sum)
                const billId = Math.round(Math.random() * 99999999)
                const payUrl = `${SERVER_URL}/payment?amount=${lacks}&label=${ctx.from.id};${room_id};${sum};${count};${billId}`
                //генерация кнопки на оплату
                const payKeyboard = await Extra.markup(
                    Markup.inlineKeyboard([
                        Markup.urlButton('Оплатить картой банка или Яндекс кошельком', `${payUrl}`)
                    ])
                )
                await send(ctx, `Не хватает средств на балансе. \nБаланс: ${balance} руб. \nНеобходимо доплатить  ${lacks} руб.`)
                await ctx.reply(`Сумма к оплате ${lacks} руб.`, payKeyboard)

                // запись внести в бд Payments со статусом ожиднание, а также к юзеру стикеры добавить
                const newPayment = new Payments({
                    payment_id: billId,
                    amount: lacks,
                    create_date: getDate(),
                    user_id: ctx.from.id
                })
                await newPayment.save()


            }
        }

        await checkBalance(sum)


    })


})


module.exports = {
    room,
    exactRoom
}