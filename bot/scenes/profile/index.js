const Scene = require('telegraf/scenes/base')
const User = require('../../../models/User');
const profile = new Scene('profile');

profile.enter(async (ctx) => {


    const user = await User.findOne({id: ctx.from.id});
    ctx.replyWithHTML(`<b>Вас зовут:</b> ${user.first_name}
<b>Куплено стикеров:</b> ${user.buyed_tickets}
<b>Баланс:</b> ${Math.round(user.balance)} руб.
<b>Выигрыши:</b> ${user.games.wins}
<b>Проигрыши:</b> ${user.games.looses}
<b>Сумма выигрышей</b>: ${user.games.total}
<b>Заработано на рефералах</b>: ${Math.floor(user.referal.bonus)}
`)
})


module.exports = {profile}