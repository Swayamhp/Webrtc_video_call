import http from 'http';
import express from "express";
import { Server} from "socket.io";
import { handleSocket } from './utils/socketHandler.js';
const app = express();
const server = http.createServer(app);

const io = new Server(server,{
  cors:{
    oigin:"*",
    method:["GET","POST"]
  }
})

io.on("connection",(socket)=>{
  console.log("user connected socket id",socket.id);

handleSocket(io,socket);
 

})


server.listen(3000,()=>{
  console.log("servere listen to the 3000 port");
})