const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");
const app = express();
const corsMiddleware = require("./middleware/cors.middleware");
const User = require("./models/User");
const depositRoutes = require("./routes/deposit.routes");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const PORT = process.env.PORT || 3000;

// config.get("serverPort");


app.use(cors());
app.use(corsMiddleware);
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/deposit", depositRoutes);
const start = async () => {
  try {
    

    await mongoose.connect(config.get("dbURL"));
    
    // await User.findOneAndUpdate({ _id: "663b95c3c8d2adc724fb5515" }, { role: "ADMIN" });
    const users = await User.find()
    console.log(users);

    app.listen(PORT, () => {
      console.log("server started on port ", PORT);
    });
  } catch (e) {
    console.log(e);
  }
};
start();
