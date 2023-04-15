import multer from 'multer';
import pool from './database';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
      cb(null, '../files')
  },
  filename: (req, file, cb) => {
        const date = new Date();
        const name = `${date.getTime()}`;
        const extension = file.originalname.split('.').pop();
        cb(null, `${name}.${extension}`)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
      cb(null, true);
  }}
).single('file');

export const uploadFile = async (req, res, next) => {
    try {
        upload(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).send({ message: 'Error al guardar imagen', error: err});
            } else if (err) {
                return res.status(500).send({ message: 'Error al guardar imagen', error: err});
            }
            req.filename = req.file.filename;
            const response = await createFile(req.file.filename, req.file.mimetype);
            if(response.severity){
                return res.status(500).send({ message: 'Error al guardar información de archivo', error: response.detail});
            }
            if(req.params.file){
                return res.status(200).json({message: `Archivo guardado.`});
            } else{
                next();
            }
        });

    }  catch (err) {
        res.status(500).send({ message: 'Internal server error', error: err});
    }
}

//Guardar datos de archivo en base de datos
const createFile = async (filename, mimetype) => {
    try {
        const response = await pool.query('INSERT INTO "FILES" ("filename", "mimetype") VALUES ($1, $2)', [filename, mimetype]);
        return response;
    } catch (err){
        return err;
    }
}

export const getAllImages = (req, res) => {
    try {
        pool.query(`SELECT * FROM "FILES" WHERE mimetype LIKE 'image%'`, (err, result) => {
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

export const updateFile = async (req, res) => {
  try {
    const pathToFile = `images/icons/${currentName}.svg`;

    upload(req, res, async function(err) { //Crea el nuevo archivo con el nombre que se haya enviado en el body
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        }
        const name = req.body.name;
        const description = req.body.description;
        if(name !== currentName && fs.existsSync(pathToFile)){
            fs.unlink(pathToFile, (err) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar imagen', error: err});
                    return
                };
            });
        }
    });

  }  catch (err) {
      res.status(500).send({ message: 'Internal server error' });
  }
}

export const deleteIcon = async (req, res) => {
  try {
      const name = req.params.name;
      const pathToFile = `images/icons/${name}.svg`;

      if(fs.existsSync(pathToFile)){
          fs.unlink(pathToFile, (err) => {
              if (err) {
                  res.status(500).send({ message: 'Error al eliminar imagen', error: err});
                  return
              }
          });
          pool.query('DELETE FROM "geometrias"."ICONOS" WHERE "NOMBRE" = $1', [name]); //Actualiza los datos del archivo en la base de datos
          return res.status(200).send({
              message: `Ícono con nombre ${name} eliminado exitosamente`,
              name: name
          });
      }
  }  catch (err) {
      res.status(500).send({ message: 'Internal server error' });
  }
}