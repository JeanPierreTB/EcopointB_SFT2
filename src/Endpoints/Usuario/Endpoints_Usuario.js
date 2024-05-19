import { Usuario } from "../../../models/Usuario.js";
import qrcode from 'qrcode';



export default function usuariosEndpoints(app){
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

    app.post('/obtener-usuario',async(req,res)=>{
      try{
        const usuario=await Usuario.findOne({
          where:{
            id:req.body.id
          }
        })
    
        if(!usuario){
          return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
        }
    
        res.status(200).send({ mensaje: "Usuario encontrado", res: true,usuario:usuario });
      }catch(e){
        console.error("Error al realizar la operación: ", e);
        res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
      }
    })
    
      


    
}





