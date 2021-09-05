const moment = require('moment')
const send = async (ctx, text, extra) => {
    try {
        if (ctx.updateType == 'message') {
            await ctx.reply(text, extra)
        } else {
            await ctx.answerCbQuery();
            await ctx.editMessageText(text, extra)
        }
    } catch (err) {
        console.log(err)
    }
}

const getDate = () => moment().format('DD.MM.YYYY')


module.exports = {send, getDate}