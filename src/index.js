import express from "express";
import { Sequelize, Op, where } from "sequelize";
import { sequelize } from "../database/database.js";
import { Usuario } from "../models/Usuario.js";
import { Punto } from "../models/Punto.js";
import { Punto_Usuario} from "../models/Punto_Usuario.js";
import { Consejos } from "../models/Consejos.js";
import { Comentario } from "../models/Comentario.js";
import { Objetivo } from "../models/Objetivo.js";
import { Objetivo_Usuario } from "../models/Objetivo_Usuario.js";
import { Recompesa } from "../models/Recompesa.js";
import { Usuario_Usuario } from "../models/Usuario_Usuario.js";
import { Notifiacion } from "../models/Notificacion.js";
import cors from "cors";
import usuariosEndpoints from "./Endpoints/Usuario/Endpoints_Usuario.js";
import PrecilajeEndPoints from "./Endpoints/Punto_de_reciclaje/Endpoints_Preciclaje.js";
import ComentarioEndPoints from "./Endpoints/Comentario/Endpoints_Comentarios.js";



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

usuariosEndpoints(app);
PrecilajeEndPoints(app);
ComentarioEndPoints(app);


app.get('/',(req,res)=>{
  res.send("Bienvenido al servidor...")
})

  
app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
  verificarconexion();
});
