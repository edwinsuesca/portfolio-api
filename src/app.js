const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors({
  origin: '*'
}));

const controllers = require('./controllers');

/* const whitelist = ['http://localhost:3400']
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error())
    }
  }
} */

// middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors({
  origin: '*'
}));

app.post('/api/send-sessage', controllers.sendMessage);

module.exports = app;