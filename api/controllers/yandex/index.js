const Payment = require("../../../models/Payments");
const User = require("../../../models/User");
const Room = require("../../../models/Room");
const {addBonusReferer} = require("../../../bot/modules/referals");

class YandexCtrl {
    async webhook(req, res) {
        console.log(req.body)
        const {label, amount, codepro, unaccepted} = req.body
        const {0: telegramId, 1: roomId, 2: sum, 3: count, 4: billId} = label.split(';')
        const payment = await Payment.findOne({payment_id: billId})
        if (payment.status === 'SUCCESS' || codepro == 'true' || unaccepted == 'true') {
            if (codepro == 'true') await bot.telegram.sendMessage(telegramId, 'Перевод защищен кодом протекции')
            if (unaccepted == 'true') await bot.telegram.sendMessage(telegramId, 'Перевод заморожен, так как на счете получателя достигнут лимит доступного остатка. ')
            return res.status(200).send({success: true})
        }
        await Payment.findOneAndUpdate({payment_id: billId}, {status: "SUCCESS"});


        //добавить баланс пользователю равен сумме пополнения count
        const user = await User.findOne({id: telegramId})
        const balance = Number(user.balance) + Number(amount)
        await User.findOneAndUpdate({id: telegramId}, {balance: Number(balance)})
        if (Number(roomId) === 0 || Number(count) === 0) {
            await bot.telegram.sendMessage(telegramId, `Оплата прошла успешно \nНовый баланс: ${balance}`)
            return res.status(200).send({success: true})
        }

        if (balance >= sum) {
            //списываем баланс
            await User.findByIdAndUpdate(user._id, {balance: balance - sum, $inc: {buyed_tickets: count}})
            //добавляем участника

            const room = await Room.findById(roomId)
            const participantIndex = room.participants.findIndex(item => item.id === user.id)
            if (participantIndex >= 0) {
                await Room.findByIdAndUpdate(roomId, {$inc: {[`participants.${participantIndex}.tickets`]: Number(count)}})
            } else {
                await Room.findByIdAndUpdate(roomId, {
                    $push: {
                        participants: {
                            id: +user.id,
                            tickets: +count,
                            username: user.username,
                        }
                    }
                })
            }

            await bot.telegram.sendMessage(telegramId, 'Покупка прошла успешно');


        } else {
            await bot.telegram.sendMessage(telegramId, `Оплата прошла успешно \nНовый баланс: ${balance} \n Не хватает: ${sum - balance}`)
        }
        //проверка на реф программу, начисление баллов
        await addBonusReferer(telegramId, amount)

        res.status(200).send({success: true})
    }
}

module.exports = new YandexCtrl();