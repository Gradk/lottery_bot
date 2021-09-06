const schedule = require('node-schedule')
const Room = require('../models/Room')
const User = require("../models/User");

const chooseWinners = async () => {

    const rooms = await Room.find({status: 'WAITING'})
    if (!rooms) return
    //проходим по всем комнатам со статусом WAITING
    await Promise.all(
        rooms.map(async room => {
            //если в комнате нет участников, то пропускаем комнату
            if (!room.participants.length) return
            //если в комнате меньше 4 участников, то отправляем сообщение что недостаточно участников
            if (room.participants.length <= 2) {
                await Promise.all(room.participants.map(async item => await bot.telegram.sendMessage(item.id, 'Недостаточно участников в комнате, розыгрыш переносится на завтра, пригласите друзей по реферальной ссылке и получите 5% с каждого пополнения')))
                return
            }
            //формируем массви всех билетов
            const tickets = []
            for (const participant of room.participants) {
                for (let i = 0; i < participant.tickets; i++) {
                    tickets.push(participant.id)
                }
            }

            //считаем выигрыш одного победителя
            const reward = Math.floor((tickets.length * room.price / 100) * (100 - room.commission) / Math.floor(room.participants.length / room.win_seats))

            //перемешиваем массив билетов
            const mixed = tickets.sort(() => Math.random() - 0.5);

            for (let i = 0; i < Math.floor(room.participants.length / room.win_seats); i++) {
                //ищем рандомного победителя
                let random = Math.floor(Math.random() * mixed.length)
                let winner = await User.findOne({id: mixed[random]})
                // console.log({winner})

                //начисляем победителю баланс
                await User.findByIdAndUpdate(winner._id, {$inc: {balance: +reward}})
                //добавляем победителя в массив победителей комнаты
                await Room.findByIdAndUpdate(room._id, {$push: {winners: {id: +winner.id, username: winner.username}}})
            }
            await Room.findByIdAndUpdate(room._id, {status: 'Finished'})
            await Room.create({created_at: Date.now(), price: room.price, commission: room.commission})
            const updatedRoom = await Room.findById(room._id)
            console.log({updatedRoom})
            await Promise.all(
                updatedRoom.participants.map(async participant => {
                    await bot.telegram.sendMessage(participant.id, `
🎉 Розыгрыш прошел успешно!

🥇 Победители: ${updatedRoom.winners.map(item => `\n     🥇 ${item.username.slice(0, -2)}**`)}

💰 Сумма выигыша каждого: ${reward} руб.
👛 Вывести средства можно на вкладке баланс`)
                })
            )
        })
    )

    // console.log('cron')
}


module.exports = async () => {
    console.log('cron started')
    await schedule.scheduleJob('0 0 13 * * *', chooseWinners);
}