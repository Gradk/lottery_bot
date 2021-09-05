const User = require('../../../models/User');


// const bot = new Telegraf(BOT_TOKEN)

const checkReferals = async (ctx) => {
    const newReferer = ctx.startPayload
    const currentUserId = ctx.from.id
    const user = await User.findOne({id: currentUserId})
    const oldReferer = user.referal.referer

    //если строчка содержит только цифры
    if (newReferer) {
        console.log(newReferer + ' существует')
        //если реферер существует и в бд ранее не записан
        if (newReferer.match(/^\d+$/) && !oldReferer) {
            console.log(newReferer + ' прошел')
            //текущемму юзеру запишем refer
            await User.findOneAndUpdate({id: currentUserId}, {"referal.referer": Number(newReferer)})
            await User.findOneAndUpdate({id: Number(newReferer)}, {$push: {'referal.referals': user.id}})
        }
    }
}
//начисление бонусов Реферу, принимает юзера текущего и сумму из которой считаем процент (sum сумма пополнения)
const addBonusReferer = async (currentUserId, sum) => {

    const user = await User.findOne({id: +currentUserId})
    console.log(user)
    const referer = await User.findOne({id: +user.referal.referer})

    if (referer) {
        let bonus = Number((sum / 100) * referer.referal.procent_bonus)

        console.log({bonus, sum, procent: referer.referal.procent_bonus})
        //найти рефера и начислить ему бонус к старому значению

        await User.findOneAndUpdate({id: +referer.id}, {
            $inc: {
                balance: +bonus.toFixed(2),
                'referal.bonus': +bonus.toFixed(2)
            }
        })

    }

}

module.exports = {checkReferals, addBonusReferer}