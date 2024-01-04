const mongoose = require('mysql2');

const bookingSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    contact_no: {
      type: Number,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    items:[
      {
        type:String,
        required:true
      }
    ],
    address:{
      type:String,
      required:true
    },
    zipcode:{
      type:String,
      required:true
    },
    timedelivery:{
      type:String,
      
    },
    weight: {
      type:String,
      required:true,
    }
    ,
    departure_date: {
        type: String,
        required: true,
    },
    return_date: {
        type: String,
        required: true,
    },
    total_price: {
        type: Number,
        required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mysql2.model('Booking', bookingSchema);

module.exports = Booking;