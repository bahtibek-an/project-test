const {Router} = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const Deposit = require("../models/Deposit");
const User = require("../models/User");
const {check, validationResult} = require("express-validator");

const depositRoutes = Router();

depositRoutes.post("/", authMiddleware, async (req, res) => {
    const {price, operation, address, withdrawalDetails, currency, depositTerm} = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({message: "Пользователь не найден"})
    }
    if (operation === "WITHDRAW") {
        if (user.balance < +price) {
            return res.status(400).json({message: "Сумма вывода больше, чем баланс"});
        }
    }
    const deposit = await Deposit.create({
        price,
        operation,
        address,
        withdrawalDetails,
        user: userId,
        currency,
        depositTerm
    });
    return res.status(201).json(deposit)
});

depositRoutes.get("/", authMiddleware, async (req, res) => {

    const deposit = await Deposit.find();
    return res.json(deposit)
});

depositRoutes.get("/transactions", authMiddleware, async (req, res) => {
    const {operation} = req.query;
    const userId = req.user.id;
    let deposit;
    if (operation) {
        deposit = await Deposit.find({user: userId, operation: operation});
    } else {
        deposit = await Deposit.find({user: userId});
    }
    return res.json(deposit);
});

depositRoutes.post("/change-status/:id", authMiddleware, [check("price").isNumeric().withMessage("Price should be a number")], async (req, res) => {
    const {id} = req.params;
    const {price} = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Некорректный запрос", errors});
        }
        const deposit = await Deposit.findByIdAndUpdate(id, {
            price: price
        }, {new: true});
        if (!deposit) {
            return res.status(404).json({message: "Операция не найдена"});
        }
        if (deposit.status === "DONE") {
            return res.status(400).json({message: "Это операция уже выполнена"});
        }

        const user = await User.findById(deposit.user);
        if (!user) {
            return res.status(404).json({message: "Пользователь не найден"});
        }

        const exchangeRate = deposit.currency === "RUB" ? await getExchangeRate() : 1;
        const amountUSD = deposit.currency === "RUB" ? deposit.price / exchangeRate : deposit.price;

        if (deposit.operation === "DEPOSIT") {
            user.balance += amountUSD;

            const referrers = await User.find({ referrals: user._id });
            referrers.forEach(async (referrer) => {
                const referralBonus = 0.10 * amountUSD;
                referrer.balance += referralBonus;
                await referrer.save();
            });
        } else {
            if (amountUSD > user.balance) {
                return res.status(400).json({message: "Баланс пользователя недостаточно для вывода"});
            } else {
                user.balance -= amountUSD;
            }
        }

        deposit.status = "DONE";
        await user.save();
        await deposit.save();

        return res.json({user, deposit});
    } catch (e) {
        console.log(e);
        return res.status(500).json("Internal server error");
    }
});

function getExchangeRate() {
    return 62.5;
}


module.exports = depositRoutes;