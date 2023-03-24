require('dotenv').config();
import https from 'https';
import fs from 'fs';
import app from './src/app'
const port = process.env.PORT || 3200;

//INICIAR SERVIDOR EN ENTORNO DE DESARROLLO
/* app.listen(port, () => {
    console.log(`Servidor web en ejecución en http://localhost:${port}`);
}); */

//INICIAR SERVIDOR EN ENTORNO DE PRODUCCIÓN

// Configura opciones de SSL/TLS
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/edwinsuesca.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/edwinsuesca.net/cert.pem')
};

// Crea un servidor HTTPS utilizando Express
https.createServer(options, app).listen(port, () => {
  console.log(`Servidor HTTPS escuchando en puerto ${port}`);
});