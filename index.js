require('dotenv').config();
const https = require('https');
const fs = require('fs');
require('dotenv').config();
const app = require('./src/app')
const port = process.env.PORT || 3200;

//INICIAR SERVIDOR EN ENTORNO DE DESARROLLO
/* app.listen(port, () => {
    console.log(`Servidor web en ejecución en http://localhost:${port}`);
}); */

//INICIAR SERVIDOR EN ENTORNO DE DESARROLLO

// Configura opciones de SSL/TLS
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/edwinsuesca.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/edwinsuesca.net/cert.pem')
};

// Crea un servidor HTTPS utilizando Express
https.createServer(options, app).listen(port, () => {
  console.log(`Servidor HTTPS escuchando en puerto ${port}`);
});