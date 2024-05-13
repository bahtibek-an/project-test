const { Schema, model } = require("mongoose");

//таблица пользователей
const Deposit = new Schema({
  price: { type: Number, required: true },
  operation: {
    type: String,
    enum: ["WITHDRAW", "DEPOSIT"],
    default: "WITHDRAW"
  },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  depositTerm: {
    type: String,
  },
  address: {
    type: String,
  },
  status: {
    type: String,
    enum: ["PROCESS", "DONE"],
    default: "PROCESS"
  }
}, { timestamps: true });

module.exports = model("Deposit", Deposit);
