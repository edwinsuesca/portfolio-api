const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN_BOT;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: true, parse_mode: 'HTML' });

const sendMessage = async (req, res) => {
    const { name, message, media } = req.body;
    if(!name || !message || !media) return res.status(400).send('Bad request');

    const messageToSend = `<b>Nombre: </b>${name}\n<b>Medio: </b>${media}\n\n<b>Mensaje: </b>\n<i>${message}</i>`
    bot.sendMessage(chatId, messageToSend, { parse_mode: 'HTML' })
    .then(() => {
        res.status(200).send('Mensaje enviado correctamente.');
    })
    .catch((error) => {
        res.status(500).send('Error al enviar el mensaje:', error);
    });
};

module.exports = {
    sendMessage
};