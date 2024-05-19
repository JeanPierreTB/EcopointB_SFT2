import { Comentario } from "../../../models/Comentario.js";
import { Op } from "sequelize";
import { Usuario } from "../../../models/Usuario.js";


export default function ComentarioEndPoints(app){
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
}