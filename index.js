const express = require('express');
const bodyParser = require("body-parser");
const oracledb = require('oracledb');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json()); // Para parsear el cuerpo de las solicitudes como JSON

const dbConfig = {
  user: 'Raygadas',
  password: 'pass',
  connectString: 'localhost:1521/XE'
};

let connection; // Variable para almacenar la conexión a la base de datos

async function connectToDB() {
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('Conexión establecida a Oracle Database');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

// Llamar a la función para conectar al iniciar el servidor
connectToDB();

app.get('/', async (req, res) => {
  try {
    console.log('Intentando conectar a la base de datos...');
    await connectToDB();
    console.log('Conexión exitosa');

    const result = await connection.execute('SELECT * FROM instrumentos');
    
    console.log('Resultados de la consulta:', result);
    
    if (!result.rows || result.rows.length === 0) {
      console.log('No se encontraron datos');
      res.status(404).send('No se encontraron datos');
    } else {
      console.log('Resultados de la consulta:', result.rows);
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error al obtener datos desde la base de datos:', error);
    res.status(500).send('Error al obtener datos desde la base de datos');
  } 
});

app.post('/registro', async (req, res) => {
  const {
    ID_INSTRUMENTO,
    NOMBRE,
    MARCA,
    MODELO,
    DESCRIPCION,
    PRECIO,
    CANTIDAD,
    ME_GUSTAS,
    IMAGEN1,
    IMAGEN2,
    TIPO
  } = req.body;

  console.log('Datos recibidos desde Flutter:', {
    ID_INSTRUMENTO,
    NOMBRE,
    MARCA,
    MODELO,
    DESCRIPCION,
    PRECIO,
    CANTIDAD,
    ME_GUSTAS,
    IMAGEN1,
    IMAGEN2,
    TIPO
  });

  if (!ID_INSTRUMENTO || !NOMBRE || !PRECIO || !DESCRIPCION || !CANTIDAD || !ME_GUSTAS || !IMAGEN1 || !IMAGEN2 || !TIPO) {
    return res.status(400).send('Datos incompletos');
  }

  console.log('Datos recibidos:', {
    ID_INSTRUMENTO,
    NOMBRE,
    MARCA,
    MODELO,
    DESCRIPCION,
    PRECIO,
    CANTIDAD,
    ME_GUSTAS,
    IMAGEN1,
    IMAGEN2,
    TIPO
  });

  try {
    const result = await connection.execute(
      `INSERT INTO instrumentos (ID_INSTRUMENTO, NOMBRE, MARCA, MODELO, DESCRIPCION, PRECIO, CANTIDAD, ME_GUSTAS, IMAGEN1, IMAGEN2, TIPO) VALUES (:ID_INSTRUMENTO, :NOMBRE, :MARCA, :MODELO, :DESCRIPCION, :PRECIO, :CANTIDAD, :ME_GUSTAS, :IMAGEN1, :IMAGEN2, :TIPO)`,
      [ID_INSTRUMENTO, NOMBRE, MARCA, MODELO, DESCRIPCION, PRECIO, CANTIDAD, ME_GUSTAS, IMAGEN1, IMAGEN2, TIPO]
    );

    console.log('Resultado de la consulta:', result);
    await connection.commit();
    res.status(200).send('Registro exitoso');
    console.log('Respuesta enviada');
  } catch (error) {
    console.error('Error al registrar instrumento:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/actualizacion/:id', async (req, res) => {
  const { id } = req.params;
  const { NOMBRE, MARCA, MODELO, DESCRIPCION, PRECIO, CANTIDAD, ME_GUSTAS, IMAGEN1, IMAGEN2, TIPO } = req.body;

  try {
    const result = await connection.execute(
      `UPDATE instrumentos SET NOMBRE = :NOMBRE, MARCA = :MARCA, MODELO = :MODELO, DESCRIPCION = :DESCRIPCION, PRECIO = :PRECIO, CANTIDAD = :CANTIDAD, ME_GUSTAS = :ME_GUSTAS, IMAGEN1 = :IMAGEN1, IMAGEN2 = :IMAGEN2, TIPO = :TIPO WHERE ID_INSTRUMENTO = :id`,
      {
        NOMBRE,
        MARCA,
        MODELO,
        DESCRIPCION,
        PRECIO,
        CANTIDAD,
        ME_GUSTAS,
        IMAGEN1,
        IMAGEN2,
        TIPO,
        id
      }
    );

    console.log('Datos recibidos para la actualización:', {
      NOMBRE,
      MARCA,
      MODELO,
      DESCRIPCION,
      PRECIO,
      CANTIDAD,
      ME_GUSTAS,
      IMAGEN1,
      IMAGEN2,
      TIPO,
      id
    });
    
    if (result.rowsAffected === 1) {
      await connection.commit();
      console.log('Actualización exitosa:', result.rowsAffected);
      res.status(200).send('Actualización exitosa');
    } else {
      res.status(404).send('No se encontró el instrumento para actualizar');
    }
  } catch (error) {
    console.error('Error al actualizar instrumento:', error);
    res.status(500).json({ error: error.message });
  }
});


app.delete('/eliminar/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Solicitud de eliminación recibida para el ID:', id);

  try {
    const result = await connection.execute(
      `DELETE FROM instrumentos WHERE ID_INSTRUMENTO = :id`,
      {
        id
      }
    );

    if (result.rowsAffected === 1) {
      await connection.commit();
      console.log('Eliminación exitosa:', result.rowsAffected);
      res.status(200).send('Eliminación exitosa');
    } else {
      res.status(404).send('No se encontró el instrumento para eliminar');
    }
  } catch (error) {
    console.error('Error al eliminar el instrumento:', error);
    res.status(500).json({ error: error.message });
  }
});





app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error en el servidor');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`El servidor está activo en el puerto ${PORT}`);
});