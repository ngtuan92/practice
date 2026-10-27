require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db");
const authRouter = require('./src/routes/authRoute');
const productRouter = require('./src/routes/productRoute');
const orderRouter = require('./src/routes/orderRoute');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    res.send({ message: "Welcome to Practical  Exam!" });
  } catch (error) {
    res.send({ error: error.message });
  }
});

app.use('/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

connectDB();
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
