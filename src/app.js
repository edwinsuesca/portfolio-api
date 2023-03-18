const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const controllers = require('./controllers');

// middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors({
  origin: '*'
}));

app.post('/api/send-sessage', controllers.sendMessage);
app.post('/api/send-comment', controllers.sendComment);

module.exports = app;