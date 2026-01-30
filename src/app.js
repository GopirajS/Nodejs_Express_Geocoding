const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const debug = require('./utils/debug');
const morgan = require('morgan');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(morgan('dev'));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/auth", require("./routes/auth.routes"));

app.use("/api/plans", require("./routes/plan.routes"));

// app.use("/api", require("./routes/web.routes"));


app.get('/', (req, res) => {
    res.status(200).send({
        status: "success",
        data: {
            message: "API working fine"
        }
    });
});

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).send({
        status: "error",
        message: err.message
    });
    next();
});

module.exports = app;
