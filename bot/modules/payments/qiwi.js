const {QIWI_TOKEN, DOMAIN_NAME} = require('../../../configs/default');
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');


const qiwiApi = new QiwiBillPaymentsAPI(QIWI_TOKEN);

const qiwiCreateBill = async (amount, telegram_id, room_id, count, sum) => {
    //генерируем счет 
    const billId = qiwiApi.generateId();
    console.log(billId + 'генерация счета');
    const fields = {
        amount,
        currency: 'RUB',
        comment: `Покупка стикеров \ntelegram_id:'${telegram_id}' \nroom_id:'${room_id}', \ncount:'${count}' , \nsum:'${sum}' \nbillId: '${billId}' `
    };

    //отправка запроса
    const bill = await qiwiApi.createBill(billId, fields)
    const payId = bill.payUrl.split('=')[1]
    return {payUrl: `${DOMAIN_NAME}/pay.php?billId=${payId}`, billId}
}


module.exports = {qiwiCreateBill, qiwiApi}

