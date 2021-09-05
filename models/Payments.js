const {Schema, model} = require('mongoose')


const PaymentsSchema = new Schema({
   payment_id : {
       type: String,
       required: true,
   },
   amount: {
       type: Number,
       required: true,
   },
   status: {
       type: String,
       default: 'WAITING' 
   },
   create_date: {
       type: String,
       required: true,
   },
   response: {
       type: Object,
       default: {}
   },
   user_id: {
       type: String,
       required: true,
   }
})



const Payment = model('Payment', PaymentsSchema)
module.exports = Payment