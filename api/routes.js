const Controllers = require('./controllers')
const {YMAuth, YMPaymentFromBuilder} = require("yoomoney-sdk");
const {YANDEX} = require("../configs/default");
const {response} = require("express");

const auth = new YMAuth(YANDEX.client_id, YANDEX.redirect_uri, YANDEX.client_secret);

module.exports = (app) => {

    app.post('/qiwi/webhook', Controllers.QiwiCtrl.webhook)
    app.post('/yandex/webhook', Controllers.YandexCtrl.webhook)
    // app.get('/form', async (req, res) => {
    //
    //     const loginPage = auth.getAuthForm(['account-info', `payment-p2p`])
    //     res.send(loginPage.toString())
    // })
    // app.get('/token', async (req, res) => {
    //     const {code} = req.query
    //     console.log(req.query)
    //     if (!code) return res.send({success: false, error: "Missing code"})
    //     const token = await auth.exchangeCode2Token(code)
    //
    //     res.send({success: true, token})
    // })
    app.get("/payment", async (req, res) => {

        const {amount, label} = req.query
        if (!amount || !label) return res.send({success: false, error: 'Missing credentials'})

        const paymentForm = new YMPaymentFromBuilder({
            receiver: YANDEX.wallet_number,
            quickPayForm: "shop",
            targets: "Покупка стикеров",
            sum: (amount / 100) * 104,
            formComment: 'Покупка стикеров',
            shortDest: 'Покупка стикеров',
            label,
            comment: '',
            successURL: YANDEX.redirect_uri,
            needFio: false,
            needEmail: false,
            needPhone: false,
            needAddress: false,
        }).buildHtml();
        res.send(paymentForm.toString());
    })


    return app
}

