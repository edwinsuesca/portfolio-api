const express = require('express');
const app = express();
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const port = process.env.PORT || 3200;
const token = process.env.TOKEN_BOT;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: true, parse_mode: 'HTML' });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/api/send-sessage', (req, res) => {
  const { name, message, media } = req.body;
  // Enviar mensaje a Telegram
  if(name && message && media){
    const messageToSend = `<b>Nombre: </b>${name}\n<b>Medio: </b>${media}\n\n<b>Mensaje: </b>\n<i>${message}</i>`
    bot.sendMessage(chatId, messageToSend, { parse_mode: 'HTML' })
    .then(() => {
      res.send('Mensaje enviado correctamente.');
    })
    .catch((error) => {
      res.send('Error al enviar el mensaje:', error);
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor web en ejecución en http://localhost:${port}`);
});



const mensaje = `<b>Nombre: </b>Lorena Acuña\n<b>Medio: </b>https://www.facebook.com\n\n<b>Mensaje: </b>\n<i>y texto con cursiva</i>`;

//bot.sendMessage(chatId, mensaje, { parse_mode: 'HTML' });