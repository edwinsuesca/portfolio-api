const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN_BOT;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: true, parse_mode: 'HTML' });

const sendMessage =  (req, res) => {
    try{
        const { name, message, media } = req.body;
        if(!name || !message || !media) return res.status(400).send('Bad request');
    
        const messageToSend = `<b>Mensaje: </b>\n<i>${message}</i>\n\n<b>Enviado por: </b>${name}\n<b>Medio: </b>${media}`
        bot.sendMessage(chatId, messageToSend, { parse_mode: 'HTML' })
        .then(() => {
            res.status(200).json({message: 'Mensaje enviado correctamente.'});
        })
        .catch((error) => {
            res.status(500).json({message: 'Error al enviar el mensaje:', error: error});
        });
    } catch (err){
        res.status(500).send('Internal server error');
    }
};

module.exports = {
    sendMessage
};