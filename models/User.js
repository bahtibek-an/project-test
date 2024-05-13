const { Schema, model } = require("mongoose");

const User = new Schema({
  tel: { type: String, required: true, unique: true }, //телефон
  email: { type: String, required: true, unique: true }, //почта
  password: { type: String, required: true }, //пароль
  secretWord: { type: String, required: true }, //секретное слово
  balance: { type: Number, default: 0 },

  role: {
    type: String,
    enum: ["USER", "PARTNER", "ADMIN"],
    default: "USER"
  },

  referrals: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }]
});

module.exports = model("User", User);
