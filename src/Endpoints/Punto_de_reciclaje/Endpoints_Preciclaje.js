import { Punto } from "../../../models/Punto.js";
import { Punto_Usuario } from "../../../models/Punto_Usuario.js";

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
      



}