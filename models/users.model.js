const mongoose = require('mysql2');

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    contact_no: {
      type: String,
      required:true
    },
    type: {
      type: String,
      required:true
    }
  },
  {
    timestamps: true,
  }
);

const User = mysql2.model('User', userSchema);

module.exports = User;