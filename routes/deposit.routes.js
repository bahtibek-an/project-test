const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const Deposit = require("../models/Deposit");

const depositRoutes = Router();

depositRoutes.post("/", authMiddleware, async (req, res) => {
    const { price, operation, address, withdrawalDetails } = req.body;
    const userId = req.user.id;
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
})

module.exports = depositRoutes;