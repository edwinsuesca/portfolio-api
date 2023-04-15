import express, { urlencoded, json } from 'express';
import path from 'path';
import cors from 'cors';
require('dotenv').config();

import * as controllers from './controllers';
import * as users from './users';
import * as files from './files';
import { authentication, verifyToken } from './authentication';

const app = express();
// middlewares
app.use(urlencoded({extended: false}));
app.use(json());
app.use(cors({
  origin: '*'
}));

// Cargar archivos
app.post('/api/files/upload/:file', files.uploadFile);
app.get('/api/files/images', authentication, files.getAllImages);
app.use('/files', express.static(path.resolve('../files')));

// Users
app.post('/api/users', authentication, users.createUser);
app.post('/api/users/login', users.login);
app.get('/api/users/verify-token', verifyToken);

// Comments and messages Telegram
app.post('/api/send-sessage', controllers.sendMessage);
app.post('/api/send-comment', controllers.sendComment);

// Categories
app.post('/api/categories', authentication, files.uploadFile, controllers.createCategory);
app.delete('/api/categories/id/:id', authentication, controllers.deleteCategory);
app.get('/api/categories', authentication, controllers.getAllCategories);

app.get('/api/categories/id/:id', controllers.getCategoryById);
app.get('/api/categories/name/:name', controllers.getCategoryByName);
app.put('/api/categories/id/:id', controllers.updateCategory);
app.get('/api/categories/active', controllers.getAllActiveCategories);

// Articles
app.post('/api/articles', authentication, files.uploadFile, controllers.createArticle);
app.delete('/api/articles/id/:id', authentication, controllers.deleteArticle);

app.get('/api/articles/id/:id', controllers.getArticleById);
app.get('/api/articles/name/:name', controllers.getArticleByName);
app.put('/api/articles/id/:id', controllers.updateArticle);
app.get('/api/articles', controllers.getAllArticles);
app.get('/api/articles/last/:amount', controllers.getLastArticles);

export default app;