import pool from './database';
import { formatUrlText, validateText } from './helpers';

// Articles
export const createArticle = (req, res) => {
    try {
        const { title, resume, content, category_id } = req.body;
        const contentToJson = JSON.stringify(content);
        const articleName = formatUrlText(title);
        const coverImage = req.filename;
        pool.query('INSERT INTO "ARTICLES" ("title", "resume", "content", "category_id", "name", "cover_image") VALUES ($1, $2, $3, $4, $5, $6)', [title, resume, contentToJson, category_id, articleName, coverImage], (err) => {
            if (err) {
                if (err.routine === "_bt_check_unique"){
                    res.status(409).send({message: 'Ya existe un artículo con el título ingresado.', error: err});
                } else {
                    res.status(500).send({message: 'Error interno del servidor.', error: err});
                }
            } else {
                res.status(200).json({message: `Artículo '${title}' guardado.`});
            }
          });
    } catch (err){
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

export const getArticleById = (req, res) => {
    try {
        const article_id = req.params.id;
        if(!Number(article_id)){
            return res.status(400).send('Parámetro incorrecto.');
        }
        pool.query('SELECT * FROM "ARTICLES" WHERE article_id = $1', [article_id], (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error interno del servidor.', error: err});
            } else {
                if (result.rows == 0) {
                    res.status(404).json({message: 'El artículo solicitado no existe.'});
                } else {
                    res.status(200).send(result.rows);
                }
            }
          });
    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const getArticleByName = (req, res) => {
    try {
        const articleName = req.params.name;
        if(!validateText(articleName)){
            return res.status(400).send('Parámetro incorrecto.');
        }
        pool.query('SELECT * FROM "ARTICLES" WHERE name = $1', [articleName], (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error al consultar artículo.', error: err});
            } else {
                if (result.rows == 0) {
                    res.status(404).json({message: 'El artículo solicitado no existe.'});
                } else {
                    res.status(200).send(result.rows);
                }
            }
          });
    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const updateArticle = (req, res) => {
    try {
        const article_id = req.params.id;
        const { title, resume, content, category_id } = req.body;
        const contentToJson = JSON.stringify(content);
        const articleName = formatUrlText(title);

        if(!Number(article_id)){
            return res.status(400).send('Parámetro incorrecto.');
        }
        
        const query = {
            text: 'UPDATE "ARTICLES" SET "title" = $1, "resume" = $2, "content" = $3, "category_id" = $4, "name" = $5, "update_date" = CURRENT_TIMESTAMP WHERE "article_id" = $6 RETURNING *',
            values: [title, resume, contentToJson, category_id, articleName, article_id]
        };
    
        pool.query(query, (err, result) =>{
            if (err) {
                console.log(err);
                if (err.routine === "_bt_check_unique"){
                    res.status(409).send({message: 'Ya existe un artículo con el título ingresado.', error: err});
                } else {
                    res.status(500).send({message: 'Error interno del servidor.', error: err});
                }
              } else if (result.rowCount === 0) {
                res.status(404).json({message: 'El artículo solicitado no existe.'});
              } else {
                res.status(200).json({message: 'Se ha actualizado el artículo.'});
              }
        });

    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const deleteArticle = (req, res) => {
    try {
        const article_id = req.params.id;

        if(!Number(article_id)){
            return res.status(400).send('Parámetro incorrecto.');
        }

        pool.query('DELETE FROM "ARTICLES" WHERE article_id = $1 RETURNING *', [article_id], (err, result) => {
          if (err) {
            res.status(500).json({message: 'Error interno del servidor.', error: err});
          } else if (result.rowCount === 0) {
            res.status(404).json({message: 'El artículo solicitado no existe.'});
          } else {
            res.status(204).json({message: 'Se ha eliminado el artículo.'});
          }
        });


    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const getAllArticles = (req, res) => {
    try {
        pool.query('SELECT * FROM "ARTICLES"', (err, result) => {
          if (err) {
            res.status(500).json({message: 'Error interno del servidor.', error: err});
          } else {
            res.send(result.rows);
          }
        });
    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const getLastArticles = (req, res) => {
    try {
        const amount = req.params.amount;
        pool.query('SELECT * FROM "ARTICLES" WHERE "active" = true ORDER BY "creation_date" DESC LIMIT $1', [amount], async (err, result) => {
          if (err) {
            res.status(500).json({message: 'Error interno del servidor.', error: err});
          } else {
            const lastArticles = await Promise.all(result.rows.map(async row => {
                const category = await getCategory(row.category_id);
                return {
                  "title": row.title,
                  "name": row.name,
                  "resume": row.resume,
                  "creationDate": row.creation_date,
                  "image": row.cover_image,
                  "category": category
                };
              }));
            res.status(200).json(lastArticles);
          }
        });
    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

// Categories
export const createCategory = (req, res) => {
    try {
        const { name } = req.body;
        const iconName = req.filename;
        pool.query('INSERT INTO "CATEGORIES" ("name", "icon") VALUES ($1, $2)', [name, iconName], (err) => {
            if (err) {
                if (err.routine === "_bt_check_unique"){
                    res.status(409).send({message: 'Ya existe una categoría con el nombre ingresado.', error: err});
                } else {
                    res.status(500).send({message: 'Error al crear la categoría.', error: err});
                }
            } else {
                res.status(200).json({message: `Categoría '${name}' creada.`});
            }
        });
    } catch (err){
        res.status(500).send({message: 'Error interno del servidor.', error: err});
    }
}

export const getCategoryById = (req, res) => {
    try {
        const category_id = req.params.id;
        if(!Number(category_id)){
            return res.status(400).send('Parámetro incorrecto.');
        }
        pool.query('SELECT * FROM "CATEGORIES" WHERE category_id = $1', [category_id], (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error al consultar la categoría.', error: err});
            } else {
                if (result.rows == 0) {
                    res.status(404).json({message: 'La categoría solicitada no existe.'});
                } else {
                    res.status(200).send(result.rows);
                }
            }
          });
    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const getCategoryByName = (req, res) => {
    try {
        const categoryName = req.params.name;
        pool.query('SELECT * FROM "CATEGORIES" WHERE name = $1', [categoryName], (err, result) => {
            if (err) {
                res.status(500).json({message: 'Error al consultar categoría.', error: err});
            } else {
                if (result.rows == 0) {
                    res.status(404).json({message: 'La categoría solicitada no existe.'});
                } else {
                    res.status(200).send(result.rows);
                }
            }
          });
    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const updateCategory = (req, res) => {
    try {
        const category_id = req.params.id;
        const { name, icon } = req.body;

        if(!Number(category_id)){
            return res.status(400).send('Parámetro incorrecto.');
        }
        
        const query = {
            text: 'UPDATE "CATEGORIES" SET "name" = $1, "icon" = $2, "update_date" = CURRENT_TIMESTAMP WHERE "category_id" = $3 RETURNING *',
            values: [name, icon, category_id]
        };
    
        pool.query(query, (err, result) =>{
            if (err) {
                console.log(err);
                if (err.routine === "_bt_check_unique"){
                    res.status(409).send({message: 'Ya existe una categoría con el nombre ingresado.', error: err});
                } else {
                    res.status(500).send({message: 'Error al actualizar categoría.', error: err});
                }
              } else if (result.rowCount === 0) {
                res.status(404).json({message: 'La categoría solicitada no existe.'});
              } else {
                res.status(200).json({message: 'Se ha actualizado la categoría.'});
              }
        });

    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const deleteCategory = (req, res) => {
    try {
        const article_id = req.params.id;

        if(!Number(article_id)){
            return res.status(400).send('Parámetro incorrecto.');
        }

        pool.query('DELETE FROM "ARTICLES" WHERE article_id = $1 RETURNING *', [article_id], (err, result) => {
          if (err) {
            res.status(500).json({message: 'Error al eliminar categoría.', error: err});
          } else if (result.rowCount === 0) {
            res.status(404).json({message: 'La categoría solicitada no existe.'});
          } else {
            res.status(204).json({message: 'Se ha eliminado la categoría.'});
          }
        });


    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const getAllCategories = (req, res) => {
    try {
        if (!req.auth.status) {
            return res.status(req.auth.code).send({ message: req.auth.message })
        }
        pool.query('SELECT * FROM "CATEGORIES"', (err, result) => {
          if (err) {
            res.status(500).json({message: 'Error al consultar las categorías.', error: err});
          } else {
            res.send(result.rows);
          }
        });
    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

export const getAllActiveCategories = (req, res) => {
    try {
        pool.query('SELECT "category_id", "name", "icon" FROM "CATEGORIES" WHERE "active" = true', (err, result) => {
          if (err) {
            res.status(500).json({message: 'Error al consultar las categorías.', error: err});
          } else {
            res.send(result.rows);
          }
        });
    } catch (err){
        res.status(500).json({message: 'Error interno del servidor.', error: err});
    }
}

const getCategory = (category_id) => {
    return new Promise((resolve, reject) => {
      try {
        pool.query('SELECT "category_id", "name", "icon" FROM "CATEGORIES" WHERE "category_id" = $1', [category_id], (err, result) => {
          if (err || result.rows.length !== 1) {
            reject(err);
          } else {
            resolve(result.rows[0]);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
