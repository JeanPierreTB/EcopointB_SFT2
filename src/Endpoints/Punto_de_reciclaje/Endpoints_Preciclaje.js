import { Punto } from "../../../models/Punto.js";
import { Punto_Usuario } from "../../../models/Punto_Usuario.js";
import { Sequelize } from "sequelize";
import { Usuario } from "../../../models/Usuario.js";

export default function PrecilajeEndPoints(app){
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
              id: req.body.id,
              tipo:req.body.tipo
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

      app.post('/punto-cancelado',async(req,res)=>{
        try{
          console.log("body:",req.body)
          const punto=await Punto.findOne({
            where:{
              lugar:req.body.lugar
            }
          })
          if(!punto){
            return res.status(404).send({ mensaje: "Punto no encontrado", res: false });
          }
      
          const Punto_Usuario1=await Punto_Usuario.destroy({
            where:{
              PuntoId:punto.id,
            }
          })
      
          
      
          res.status(200).send({ mensaje: "Punto Cancelado", res: true,punto:punto });
      
      
          /*const usuario=await Usuario.findOne({
            where:{
              id:req.body.id
            }
          })
      
          if(!usuario){
            return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
          }
      
      
          const usuarioActualizado = await Usuario.update(
            { 
              puntaje: usuario.puntaje + punto.puntos,
              puntosrecilados:usuario.puntosrecilados+1
            
            },
            {
              where: {
                id:req.body.id
              }
            }
          );
          
      
          if(!usuarioActualizado){
            return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
          }*/
    
          
      
        }catch(e){
          console.error("Error al realizar la operación: ", e);
          res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
        }
      })


      app.post('/punto-cancelado-qr',async(req,res)=>{
        try{
      
          if(req.body.lugarseleccionado===req.body.lugar){
            const punto=await Punto.findOne({
              where:{
                latitud:req.body.latitud,
                longitud:req.body.longitud,
                lugar:req.body.lugar,
                tipo:req.body.tipo
              }
              
            })
        
            if(!punto){
              return res.status(404).send({ mensaje: "Punto no encontrado", res: false });
        
            }
      
            const usuario=await Usuario.findOne({
              where:{
                id:req.body.id
              }
            })
        
            if(!usuario){
              return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
            }
      
            const cantidad=req.body.cantidad;
            const usuariop=usuario.puntaje;
            let puntajenuevo;
      
            switch(punto.tipo){
              case "Papel":
                puntajenuevo=usuariop+(cantidad*3);
                break;
              case "Plástico":
                puntajenuevo=usuariop+(cantidad*3);
                break;
              case "Metal":
                puntajenuevo=usuariop+(cantidad*3);
                break;
              case "Baterias":
                puntajenuevo=usuariop+(cantidad*2);
                break;
              case "Ropa":
                puntajenuevo=usuariop+(cantidad*4)
                break;
      
            }
        
        
            const usuarioActualizado = await Usuario.update(
              { 
                puntaje: puntajenuevo
              
              },
              {
                where: {
                  id:req.body.id
                }
              }
            );
            
        
            if(!usuarioActualizado){
              return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
            }
      
            const fechaHoy = new Date();
            const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];
      
            const Punto_Usuario1=await Punto_Usuario.update(
              { 
                realizado:true,
                PuntoId:null,
                fecha:fechaHoySinHora,
                cantidad:req.body.cantidad
              
              },
              {
                where: {
                  PuntoId:punto.id,
                }
              }
              
              
              
            )
      
            /*where:{
                PuntoId:punto.id,
              } */
        
      
            res.status(200).send({ mensaje: "Punto Realizado", res: true,punto:punto });
      
          }
      
          else{
            return res.status(404).send({ mensaje: "Lugares no coinciden", res: false });
          }
          
      
      
        }catch(e){
          console.error("Error al realizar la operación: ", e);
          res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
        }
      })
      



}