/* eslint-disable no-console */
const express = require("express");

const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const cookieParser = require('cookie-parser');

require("dotenv").config();
const routes = require("./routes/routes.js");

// setup body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cors());

// allowing cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

(async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      autoIndex: false,
    };
    // connect you DB here
    await mongoose.connect(process.env.DB_URL, options);
    console.log("connected to DB");
  } catch (err) {
    console.log(err.toString());
  }
})();

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Server Up",
  });
});

// Spin up dev server
const PORT = process.env.PORT || 8080;

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
