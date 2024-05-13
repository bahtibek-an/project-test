const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const { registerValidator, loginValidator } = require("../dto/auth.dto");
const router = new Router();

router.post("/registration", registerValidator, async (req, res) => {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Некорректный запрос", errors });
    }
    const { tel, email, password, secretWord, role, referal } = req.body;
    const candidate_email = await User.findOne({ email });

    if (candidate_email) {
      return res
        .status(400)
        .json({
          message: `Пользователь с почтой ${email} уже зарегистрирован`,
        });
    }

    const hashPassword = await bcrypt.hash(password, 5);

    const user = new User({
      tel,
      email,
      password: hashPassword,
      secretWord,
      role,
    });

    if(referal) {
      await User.findByIdAndUpdate(referal, {
        $push: { referrals: user._id },
      })
    }

    await user.save();

    return res.json({ message: "Аккаунт создан" });
  } catch (e) {
    console.log(e);
    res.send({ message: "Ошибка сервера" });
  }
}
);

router.post("/login", loginValidator, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Некорректный запрос", errors });
    }

    const { tel, email, password } = req.body;
    const user = await User.findOne({ email }).populate("referrals");


    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const isPassValid = bcrypt.compareSync(password, user.password);

    if (!isPassValid) {
      return res
        .status(400)
        .json({ message: "Неправильный пароль или номер телефона" });
    }

    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .json({
        token,
        user: {
          id: user.id,
          tel: user.tel,
          email: user.email,
          role: user.role,
          balance: user.balance,
          referrals: user.referrals
        },

      });
  } catch (e) {
    console.log(e);
    res.send({ message: "Server error" });
  }
}
);

router.get("/auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).populate("referrals");

    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1d",
    });

    return res.json({
      token,
      user: {
        id: user.id,
        tel: user.tel,
        email: user.email,
        role: user.role,
        balance: user.balance,
        referrals: user.referrals
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Server error" });
  }
});


router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("referrals");

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    return res.json({
      user: {
        id: user.id,
        tel: user.tel,
        email: user.email,
        role: user.role,
        balance: user.balance,
        referrals: user.referrals,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Server error" });
  }
});
module.exports = router;
