require('dotenv').config();
const app = require('./src/app')
const port = process.env.PORT || 3200;
app.listen(port, () => {
    console.log(`Servidor web en ejecución en http://localhost:${port}`);
});