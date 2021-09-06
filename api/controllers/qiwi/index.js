const axios = require('axios');
const {QIWI_OAUTH_TOKEN} = require('../../../configs/default')
const Payment = require('../../../models/Payments')
const User = require('../../../models/User')
const Room = require('../../../models/Room')
const {addBonusReferer} = require('../../../bot/scenes/referals')


const instance = axios.create({
    baseURL: 'https://edge.qiwi.com',
    headers: {Authorization: `Bearer ${QIWI_OAUTH_TOKEN}`}
});

const telegramRegex = /telegram_id:'(.*?)'/gm
const roomRegex = /room_id:'(.*?)'/gm
const countRegex = /count:'(.*?)'/gm
const sumRegex = /sum:'(.*?)'/gm
const billIdRegex = /billId: '(.*?)'/gm


class QiwiCtrl {
    async webhook(req, res) {
        console.log(req.body)
        const {messageId, hookId, payment, hash, total} = req.body
        const {status, comment} = payment
        const {amount} = total

        let tgMatch, telegramId
        let roomMatch, roomId
        let countMatch, count
        let sumMatch, sum
        let billMatch, billId

        while (tgMatch = telegramRegex.exec(comment))
            telegramId = +tgMatch[1];
        while (roomMatch = roomRegex.exec(comment))
            roomId = roomMatch[1];
        while (countMatch = countRegex.exec(comment))
            count = countMatch[1];
        while (sumMatch = sumRegex.exec(comment))
            sum = sumMatch[1]
        while (billMatch = billIdRegex.exec(comment))
            billId = billMatch[1];

        console.log({
            telegramId, roomId, count, sum, billId
        })

        if (status !== 'SUCCESS') return res.status(200).send({success: false})

        await Payment.findOneAndUpdate({payment_id: billId}, {status})

        //добавить баланс пользователю равен сумме пополнения count
        const user = await User.findOne({id: telegramId})
        const balance = user.balance + amount
        await User.findOneAndUpdate({id: telegramId}, {balance})


        if (balance > sum) {
            //списываем баланс
            await User.findByIdAndUpdate(user._id, {balance: balance - sum, $inc: {buyed_tickets: count}})
            //добавляем участника

            const room = await Room.findById(roomId)
            const participantIndex = room.participants.findIndex(item => item.id === user.id)
            if (participantIndex) {
                await Room.findByIdAndUpdate(roomId, {$inc: {[`participants.${participantIndex}.tickets`]: 1}})
            } else {
                await Room.findByIdAndUpdate(roomId, {
                    $push: {
                        participants: {
                            id: user.id,
                            $inc: {tickets: count},
                            username: user.username,
                        }
                    }
                })
            }

            await bot.telegram.sendMessage(telegramId, `Покупка прошла успешно, \nРозыгрыш будет проведен завтра в 13:00 (мск)`)
            //проверка на реф программу, начисление баллов
            await addBonusReferer(telegramId, sum)

        } else {
            await bot.telegram.sendMessage(telegramId, `Оплата прошла успешно \nНовый баланс: ${balance} \n Не хватает: ${sum - balance}`)
        }


        res.status(200).send({success: true})


    }
}

module.exports = new QiwiCtrl()
