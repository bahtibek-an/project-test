const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const Deposit = require("../models/Deposit");
const User = require("../models/User");

const depositRoutes = Router();

depositRoutes.post("/", authMiddleware, async (req, res) => {
    const { price, operation, address, withdrawalDetails } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if(!user) {
        return res.status(404).json({ message: "Пользователь не найден" })
    }
    if(operation === "WITHDRAW") {
        if(user.balance < +price) {
            return res.status(400).json({ message: "Сумма вывода больше, чем баланс" });
        }
    }
    const deposit = await Deposit.create({ price, operation, address, withdrawalDetails, user: userId });
    return res.status(201).json(deposit)
});

depositRoutes.get("/", authMiddleware, async (req, res) => {
    const deposit = await Deposit.find();
    return res.json(deposit)
});

depositRoutes.get("/transactions", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const deposit = await Deposit.find({ user: userId });
    return res.json(deposit);
});

depositRoutes.get("/change-status/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const deposit = await Deposit.findById(id);
        if(!deposit) {
            return res.status(404).json({ message: "Операция не найдена" });
        }
        if(deposit.status === "DONE") {
            return res.status(400).json({ message: "Это операция уже выполнена" });
        }
        const user = await User.findById(deposit.user);
        if(!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        if(deposit.operation === "DEPOSIT") {
            user.balance = user.balance + deposit.price;
        } else {
            if(deposit.price > user.balance) {
                return res.status(400).json({ message: "Баланс пользователя недостаточно для вывода" });
            } else {
                user.balance = user.balance - deposit.price;
            }
        }
        deposit.status = "DONE";

        await user.save();
        await deposit.save();

        return res.json({ user, deposit });
    } catch (e) {
        return res.status(500).json("Internal server error");
    }

});

module.exports = depositRoutes;