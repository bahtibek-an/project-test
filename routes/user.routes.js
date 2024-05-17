const Router = require("express");
const Staking = require("../models/Staking"); // Подключаем модель стейкинга
const User = require("../models/User"); // Подключаем модель стейкинга
const router = new Router();

// GET запрос для получения всех записей стейкинга
router.get("/staking", async (req, res) => {
  try {
    const allStakings = await Staking.find(); // Получаем все записи стейкинга из базы данных

    // Возвращаем все записи стейкинга
    // return res.json({ stakings: allStakings });
    return res.json(allStakings);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});


// GET запрос для получения всех записей стейкинга
router.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find(); // Получаем все записи стейкинга из базы данных

    // Возвращаем все записи стейкинга
    return res.json({ users: allUsers });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
