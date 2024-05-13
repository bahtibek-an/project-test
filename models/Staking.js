const { Schema, model } = require("mongoose");

const Staking = new Schema({
  ID: { type: Number, required: true }, // Идентификатор
  summa: { type: String, required: true }, // Сумма
  date: { type: [String], required: true }, // Дата открытия и закрытия
  procent: { type: [String], required: true }, // Срок стейкинга и доходность
  income: { type: [String], required: true }, // Текущий доход и ожидаемая доходность
  Status: {
    status: { type: String, required: true }, // Статус стейкинга
    text: { type: String, required: true } // Текстовое представление статуса
  }
});

module.exports = model("Staking", Staking);
