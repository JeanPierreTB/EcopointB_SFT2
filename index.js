import express from "express";
import { Sequelize, Op, where } from "sequelize";
import { sequelize } from "./database/database.js";
import { Usuario } from "./models/Usuario.js";
import { Punto } from "./models/Punto.js";
import { Punto_Usuario} from "./models/Punto_Usuario.js";
import { Consejos } from "./models/Consejos.js";
import { Comentario } from "./models/Comentario.js";
import { Objetivo } from "./models/Objetivo.js";
import { Objetivo_Usuario } from "./models/Objetivo_Usuario.js";
import { Recompesa } from "./models/Recompesa.js";
import { Usuario_Usuario } from "./models/Usuario_Usuario.js";
import { Notifiacion } from "./models/Notificacion.js";
import moment from 'moment';
import cors from "cors";
import qrcode from 'qrcode';


const app = express();
const port = 3001;
app.use(cors());


const verificarconexion = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Conexion a base de datos exitosa");
  } catch (e) {
    console.error("No se logró conectar ", e);
  }
};


app.use(express.json());

app.post("/insertar-usuario", async (req, res) => {
  const {nombre,contrasena,dni,ntelefono}=req.body
  console.log("body:",req.body)
  try {
    const userinfo = await Usuario.create({
      nombre: nombre,
      contrasena: contrasena,
      dni: dni,
      ntelefono: ntelefono
    });

    const objetivos=await Objetivo.findAll({})

    const registrosObjetivoUsuario = objetivos.map(objetivo => ({
      UsuarioId: userinfo.id,
      ObjetivoId: objetivo.id,
    }));

    await Objetivo_Usuario.bulkCreate(registrosObjetivoUsuario);

    res.status(201).send({mensaje:"Usuario creado",res:true});
  } catch (e) {
    console.error("Error al insertar el usuario: ", e);
    res.status(500).send({mensaje:"Error interno en el servidor",res:false});
  }
});

app.post("/verificar-usuario", async (req, res) => {
  try {
    const { nombre, contrasena } = req.body;

    const usuario = await Usuario.findOne({
      where: {
        nombre: nombre,
        contrasena: contrasena,
      },
    });

    if (usuario) {
      res.status(200).json({ mensaje: "Usuario verificado correctamente",res:true,usuario:usuario});
    } else {
      res.status(401).json({ mensaje: "Nombre de usuario o contraseña incorrectos",res:false });
    }
  } catch (e) {
    console.error("Error al verificar el usuario: ", e);
    res.status(500).json({ mensaje: "Error interno del servidor",res:false});
  }
});


app.post("/usuario-existente",async(req,res)=>{
  try{
    const usuario=await Usuario.findOne({
      where:{
        nombre:req.body.nombre
      }
    })
    if(usuario){
      res.status(200).json({ mensaje: "Usuario existe",res:true,usuario:usuario});

    }else{
      res.status(401).json({ mensaje: "Usuario no existe",res:false });

    }
  }catch(e){
    console.error("Error al verificar el usuario: ", e);
    res.status(500).json({ mensaje: "Error interno del servidor",res:false});
  }
})



  app.post('/cambio_contra', async (req, res) => {
    try {
        const { nombre, contrasena } = req.body;
        const usuario = await Usuario.update({
            contrasena: contrasena
        }, {
            where: {
                nombre: nombre
            }
        })

        if (usuario[0] === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado',res:false});
        }

        res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente',res:true});
    } catch (e) {
        console.error(e); 
        res.status(500).json({ mensaje: 'Error interno del servidor',res:false});
    }
});

app.post('/agregar-punto', async (req, res) => {
  try {
    const { latitud, longitud, lugar,tipo } = req.body;

    const qrCodeData = JSON.stringify({
      latitud: latitud,
      longitud: longitud,
      lugar: lugar,
      tipo:tipo
    });

    const qrCodeBase64 = await qrcode.toDataURL(qrCodeData);

    const newpunto = await Punto.create({
      latitud: latitud,
      longitud: longitud,
      lugar: lugar,
      codigoqr: qrCodeBase64,
      tipo:tipo
    });

    res.status(201).send({
      mensaje: 'Punto creado',
      res: true,
      qrCodeBase64: qrCodeBase64 
    });
  } catch (e) {
    console.error('Error al crear punto: ', e);
    res.status(500).send({ mensaje: 'Error interno en el servidor', res: false });
  }
});


app.get('/obtener-puntos',async(req,res)=>{
  try{
    const Allpunto=await Punto.findAll({})

    res.status(200).send({ mensaje: "Puntos obtenidos correctamente", puntos: Allpunto, success: true });

  }catch(e){
    console.error("Error al obtener punto: ",e );
    res.status(500).send({mensaje:"Error interno en el servidor",res:false})
  }
})


app.post('/realizar-punto', async (req, res) => {
  try {
    // Buscar el punto
    const punto = await Punto.findOne({
      where: {
        id: req.body.id
      }
    });

    if (!punto) {
      return res.status(404).send({ mensaje: "Punto no encontrado", res: false });
    }


    await Punto_Usuario.create({
      UsuarioId: req.body.idu,
      PuntoId: punto.id,
      realizado:false,
      cantidad:0
    });

    res.status(200).send({ mensaje: "Operación exitosa", res: true });
  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});


app.post('/obtener-punto-realizar', async (req, res) => {
  try {
    const puntosUsuario = await Punto_Usuario.findAll({
      where:{
        realizado:false,
        UsuarioId:req.body.usuario
      }
    });

    const puntoIds = puntosUsuario.map(puntoUsuario => puntoUsuario.PuntoId);

    const puntos = await Punto.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: puntoIds
        }
      }
    });

    res.status(200).send({ mensaje: "Operación exitosa", res: true, puntos });

  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});



app.post('/realizar-comentario',async(req,res)=>{
  try{

    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const nuevocomentario=await Comentario.create({
      des:req.body.des,
      tipo:req.body.tipo,
      idUsuario:req.body.id,
      fecha:fechaHoySinHora
    })
    res.status(201).send({mensaje:"Comentario creado",res:true});

  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.get('/obtener-comentarios', async (req, res) => {
  try {
    
  
    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const comentariosHoy = await Comentario.findAll({
      where: {
        fecha:fechaHoySinHora,
        tipo:{
          [Op.ne]: 4
        }
      },
      include:[
        {
          model:Usuario
        }
      ],
      order: [['id', 'ASC']]
    });

    res.status(200).send({ comentarios: comentariosHoy, res: true });
  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});





app.post('/actualizar-foto', async (req, res) => {
  try {
      const usuario = await Usuario.update(
          { foto: req.body.foto },
          {
              where: {
                 id:req.body.id
              }
          }
      );

      if (usuario[0] === 0) {
          return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
      }

      res.status(200).send({ mensaje: "Usuario actualizado", res: true, usuario: usuario });

  } catch (e) {
      console.error("Error al realizar la operación: ", e);
      res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});


app.post('/actualizar-datos-usuario', async (req, res) => {
  try {
    const usuario = await Usuario.update({
      nombre: req.body.nombre,
      contrasena: req.body.contrasena, 
      dni: req.body.dni,
      ntelefono: req.body.ntelefono,
    }, {
      where: {
        id: req.body.id
      }
    });

    if (usuario[0] === 1) {
      res.status(200).send({ mensaje: "Datos de usuario actualizados correctamente", res: true });
    } else {
      res.status(404).send({ mensaje: "El usuario no existe", res: false });
    }
  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});



app.get('/',(req,res)=>{
  res.send("Bienvenido al servidor...")
})

  

app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
  verificarconexion();
});
