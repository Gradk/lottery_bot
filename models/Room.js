const {Schema, model} = require('mongoose')

const ParticipantSchema = new Schema({
    id:{
        type: Number,
        required: true,
    },
    tickets: {
        type: Number,
        default: 0
    },
    username: {
        type: String,
        required: true
    }
})

const RoomSchema = new Schema({
  price: {
    type: Number,
    default: 30
  },
  seats: {
    type: Number,
    default: 0
  },
  participants: {
      type: [ParticipantSchema],
      default: []
  },
  alive_time: {
      type: Number,
      default: 1
  },
  created_at: {
      type: String,
      required: true,
  },
  winners: {
    type: [ParticipantSchema],
    default: [],
  },
  win_seats: {
      type: Number,
      default: 3
  },
  commission: {
      type: Number,
      default: 20
  },
    status: {
      type: String,
        default: 'WAITING'
    }


    
})

const User = model('Room', RoomSchema)
module.exports = User

