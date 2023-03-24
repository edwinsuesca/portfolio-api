import pool from './database';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
const chatId = process.env.CHAT_ID;
import { bot } from './controllers';

export const login = async (req, res) => {
    try{
        const {username, password} = req.body;
        if(!username || !password){
            sendLoginNotification(username, false);
            res.status(401).send({ message: 'Nombre de usuario o contraseña incorrecta' });
            return;
        }
        pool.query('SELECT * FROM "USERS" WHERE "username" = $1', [username], async (err, results) => {
            if(err){
                sendLoginNotification(username, false);
                res.status(500).send({message: 'Error al crear la categoría.', error: err});
            }
            if(results.rowCount === 1 && results.rows[0]['active']){
                if(await bcrypt.compare(password, results.rows[0].password)){
                    const encoder = new TextEncoder();
                    const {user_id, username} = results.rows[0];
                    const jwtConstructor = new jose.SignJWT({user_id, username});
                    const token = await jwtConstructor
                        .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
                        .setIssuedAt().setExpirationTime('1h').sign(encoder.encode(process.env.JWT_PRIVATE_KEY));
                    sendLoginNotification(username, true);
                    return res.status(200).json({
                        username: username,
                        token: token
                    })
                } else{
                    sendLoginNotification(username, false);
                    res.status(401).send({ message: 'Nombre de usuario o contraseña incorrecta' })
                }
            } else {
                sendLoginNotification(username, false);
                return res.status(401).send({ message: 'Nombre de usuario o contraseña incorrecta' })
            }
        });
    } catch (err){
        sendLoginNotification(username, false);
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
};

export const createUser = async (req, res) => {
    try {
        if (!req.auth.status) {
            return res.status(req.auth.code).send({ message: req.auth.message })
        }
        const username = req.body.username.trim();
        const { password } = req.body;

        let passHaash = await bcrypt.hash(password, 8);

        pool.query('INSERT INTO "USERS" ("username", "password") VALUES ($1, $2)', [username, passHaash], (err) => {
            if (err) {
                if (err.routine === "_bt_check_unique"){
                    res.status(409).send({message: 'Nombre de usuario no disponible.', error: err});
                } else {
                    res.status(500).send({message: 'Error al crear usuario.', error: err});
                }
            } else {
                res.status(200).json({message: `Usuario '${username}' creado.`});
            }
        });
    } catch (err) {
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
};

export const updateUserById = async (req, res) => {
    try{
        if (!req.auth.status) {
            return res.status(req.auth.code).send({ message: req.auth.message })
        }
        const id = parseInt(req.params.id);
        let idIsNum = id == req.params.id
        if(!idIsNum){return res.status(400).send({message: 'Parámetro incorrecto'})};
        
        let user = await helpers.findUserById(id);
        if (!user) {
            return res.status(204).send({ message: 'Ningún registro para actualizar.' })
        }
        const { userStatus, password } = req.body;
        const names = req.body.names.trim();
        const lastnames = req.body.lastnames.trim();
        const email = req.body.email.trim();
        
        const tipo_identificacion = Number(req.body.documentType);
        const num_identificacion = Number(req.body.document);
        const aud_usuario = req.auth.username;
        
        assignRolesToUser(req.body.roles, id, aud_usuario); //Actualizar o crear rol para el usuario
        if(req.body.password == null){
            await pool.query('UPDATE "USUARIO" SET "NOMBRES" = $1, "APELLIDOS" = $2, "EMAIL" = $3, "IDENTIFICACION" = $4, "FID_TIPO_IDENTIFICACION" = $5, "ESTADO" = $6, "AUD_USUARIO" = $7, "MODIFICADO" = CURRENT_TIMESTAMP WHERE "ID_USUARIO" = $8', [names, lastnames, email, num_identificacion, tipo_identificacion, userStatus, aud_usuario, id]);
        } else {
            let passHaash = await bcrypt.hash(password, 8);
            await pool.query('UPDATE "USUARIO" SET "NOMBRES" = $1, "APELLIDOS" = $2, "EMAIL" = $3, "IDENTIFICACION" = $4, "FID_TIPO_IDENTIFICACION" = $5, "ESTADO" = $6, "AUD_USUARIO" = $7, "CLAVE" = $8, "MODIFICADO" = CURRENT_TIMESTAMP WHERE "ID_USUARIO" = $9', [names, lastnames, email, num_identificacion, tipo_identificacion, userStatus, aud_usuario, passHaash, id]);
        }
        res.status(200).json({message: `Usuario actualizado con éxito.`});
    } catch (err) {
        res.status(500).send({ message: 'Internal server error', error: err });
    }
};

export const sendLoginNotification =  (username, successful) => {
    try{
        const date = new Date().toLocaleString()
        const message = successful ? `${username} ha realizado un inicio de sesión exitoso.\n\n${date}` : `${username} ha realizado un inicio de sesión fallido.\n\n${date}`
        const messageToSend = `<b>INICIO DE SESIÓN: </b><i>${message}</i>`
        bot.sendMessage(chatId, messageToSend, { parse_mode: 'HTML' })
        .catch((error) => {});
    } catch (err){}
};