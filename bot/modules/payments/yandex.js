const {YMApi} = require("yoomoney-sdk");
const {YANDEX} = require("../../../configs/default");


async function sendPayment(wallet, amount) {
    try {
        const api = new YMApi(YANDEX.token)
        console.log({request})
        console.log(response)
        // Запрашиваем платёж
        const request = await api.requestPayment({
            amount: +amount,
            pattern_id: "p2p",
            to: wallet
        });


        // Где-то тут можно сохранить ID платежа в ДБ и оставить на потом

        // Подтверждаем платёж
        const response = await api.processPayment({
            money_source: "wallet",
            request_id: request.request_id
        });

        return {
            success: response.status === 'success',
            message: response.status === 'success' ? 'Платёж успешно отправлен' : `Попробуйте еще раз\nКод операции: ${response.status}`
        }
    } catch (e) {
        return {success: false, message: 'Ошибка при отправке платежа, возможно у вас анонимный кошелек, идентифицируйте его. Или напишите в поддержку @gradk'}
    }
}

module.exports = {sendPayment}