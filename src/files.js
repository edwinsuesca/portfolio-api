import multer from 'multer';
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
            next();
        });

    }  catch (err) {
        res.status(500).send({ message: 'Internal server error', error: err});
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