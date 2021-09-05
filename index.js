const {mongoInit} = require('./modules');
const botInit = require('./bot/bot');
const apiInit = require('./api/app');
const cronInit = require('./cron');
const {YANDEX} = require('./configs/default');
const Room = require('./models/Room')

const {YMApi, YMAuth, YMPaymentFromBuilder} = require("yoomoney-sdk");
const User = require("./models/User");


(async () => {
    db = await mongoInit();
    app = await apiInit();
    bot = await botInit();
    cron = await cronInit();

    //await User.updateMany({}, {'referal.bonus': 0})
    // const api = new YMApi(YANDEX.token)
    // api.accountInfo().then(console.log);

})()