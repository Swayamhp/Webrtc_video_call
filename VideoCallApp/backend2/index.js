import http from 'http';
import express from "express";
import { Server} from "socket.io";
import * as mediaSoup from "mediasoup"
import {v4 as uuidv4} from "uuid"
import { clearLine } from 'readline';
const app = express();
const server = http.createServer(app);

const io = new Server(server,{
  cors:{
    oigin:"*",
    method:["GET","POST"]
  }
})

// creating media soup router 
const mediaCodecs = [
  {
    kind        : "audio",
    mimeType    : "audio/opus",
    clockRate   : 48000,
    channels    : 2
  },
  {
    kind       : "video",
    mimeType   : "video/H264",
    clockRate  : 90000,
    parameters :
    {
      "packetization-mode"      : 1,
      "profile-level-id"        : "42e01f",
      "level-asymmetry-allowed" : 1
    }
  }
  
]
	
// const webrtcServer = worker.createWebRtcServer({
//     listenInfos :
//     [
//       {
//         protocol : 'udp',
//         ip       : '9.9.9.9',
//         port     : 20000
//       },
//       {
//         protocol : 'tcp',
//         ip       : '9.9.9.9',
//         port     : 20000
//       }
//     ]
//   })
const room = {
  id:"main-room",
  router: null,
  peers: new Map()
};
async function createRoom(roomId){
const worker = await mediaSoup.createWorker();
const router = await  worker.createRouter({mediaCodecs});
room.router = router;
room.id = roomId;
}
function createPeer(socketId){
  return {
    id:socketId,
    sendTransport:null,
    recvTransports: new Map(),
    producers: new Map(),
    consumers: new Map()
  }
}
console.log("media soup version",mediaSoup.version);
mediaSoup.observer.on("newwoker",(worker)=>{
  console.log("New worker created !",worker);
})
// worker.close(); // closed the worker
// console.log("worker pid",worker.pid);
// console.log("Is worker closed",worker.closed);
// console.log("Is worker unexpectedly died",worker.died);
// console.log("Is worker is completed",worker.subprocessClosed);
// worker.on("died",(error)=>{
//   console.log("worker subprocess unexpectedly died",error);
// })
// worker.on("subprocesslose",()=>{
//   console.log("worker subprocess unexpectedly closed afterr died",);
// })
// worker.on("listenererror",(eventName,error)=>{
//   console.log("listeneror error of event name and error is ",eventName,error);

// })
// worker.observer.on("newrouter",(router)=>{
//   console.log("New router created [id:%s]",router.id);
// })
// worker.observer.on("newwebrtcserver", (webRtcServer) =>
// {
//   console.log("new WebRTC server created [id:%s]", webRtcServer.id);
// });
// console.log("Rtp capabilities it isonly provide supported rtp capabilities",mediaSoup.getSupportedRtpCapabilities());
//Router enables injection,seletion and forwarding of media streams though transport instance created on it 
// const router = await worker.createRouter({mediaCodecs});
// console.log("The rtp capablities of router is ",router.rtpCapabilities);
// let rooms = {
//   router,
//   peer: new Map() // roomId  is key
// }
// Global map of rooms 
const rooms = new Map();

//structure of rooms
// {
//   router:Router,
//   peer: new Map()
// }

//structure of peer 
// {
//   id: socket.id, // unique per connected client
//   name: username, // optional
//   sendTransports: new Map(), // transport.id -> WebRtcTransport
//   recvTransports: new Map(), // transport.id -> WebRtcTransport
//   producers: new Map(), // producer.id -> Producer
//   consumers: new Map(), // consumer.id -> Consumer
// }

const producerList = [];
io.on("connection",(socket)=>{
  console.log("user connected socket id",socket.id);

  socket.on("join-room",async({roomId},callback)=>{
    console.log("The room id joined by rooomId:",roomId);
    if(!room.router){
     await createRoom(roomId);
    }
      console.log("this is roomId",roomId);
     const router = room?.router;  
     if(!room.peers.get(socket.id)){
       room.peers.set(socket.id,createPeer(socket.id));
     }
     console.log("producerList*********************",producerList);
     for( const producer of producerList){
      console.log("This is produccer***************",producer);
          socket.emit("consume-all-producer",{producer})
     }
    callback({roomId,rtpCapabilities:router.rtpCapabilities});
  
  })
  socket.on("createTransport",async ({roomId},callback)=>{
    try{
      const router =room.router;
    const peers = room.peers;
      const sendTransport = await  router.createWebRtcTransport({
        listenIps: [{ip:"0.0.0.0",announcedIp:"127.0.0.1"}],
        enableUdp:true,
        enableTcp:true,
        preferUdp:true
      });
      peers.get(socket.id).sendTransport = sendTransport;


      //send parameters to client 
      // Monitor transport state on server side

      callback(
        {
          id : sendTransport.id,
          iceParameters: sendTransport.iceParameters,
          iceCandidates: sendTransport.iceCandidates,
          dtlsParameters: sendTransport.dtlsParameters,
        }
      )

    console.log(room);
    }catch(error){
      console.log(error.message);
    }
    
  })
   socket.on("connectTransport",async({transportId,roomId,dtlsParameters,direction},callback)=>{
     try{
    const peers = room.peers;
    if(!transportId)throw new Error("Transport id not defined");
    if(!dtlsParameters)throw new Error("Dtls not provided");
    if(!direction) throw new Error("Direction not provided");
   
    //  console.log("Transport id,roomId,dtlsParameter,direction",transportId,roomId,dtlsParameters,direction)
    let transport;
      if(direction==="produce"){
        console.log("This is produce")
             transport = peers.get(socket.id).sendTransport;

     }
     else if(direction === "consume"){
      console.log("This is consume");
       transport = peers.get(socket.id).recvTransports.get(transportId);
     }
       await transport.connect({dtlsParameters});
       transport.on("connectionstatechange",(state)=>{
 console.log("This tansport state");
       })
      


    callback({connected:true})
    }catch(error){
      console.log("This is error message",error.message);
    }
  })
  socket.on("produce",async ({kind,rtpParameters,roomId},callback)=>{
  
    try{
      const peers = room.peers;
    const transport = peers.get(socket.id).sendTransport;     
    
      const producer = await transport.produce({kind,rtpParameters});
      peers.get(socket.id).producers.set(producer.id,producer);
      
      callback({id:producer.id});
      //Notify all sockets to that producer has given
       producerList.push({producerId:producer.id,producerSocketId:socket.id,kind:producer.kind});
      for( const [otherSocket,peer] of peers){
        // console.log("This is socket id",otherSocket);
        // console.log('This is peer',peer);
        if(otherSocket === socket.id)continue;
        io.to(otherSocket).emit("newProducer",{
          producerId:producer.id,
          producerSocketId:socket.id,
          kind:producer.kind,
        })
      }
    }
    catch(error){
      console.log(error);
    }

    
  })
  socket.on("createRcvTransport",async({roomId},callback)=>{
    const router = room.router;
    const peers = room.peers;
      const rcvTransport = await router.createWebRtcTransport({
        listenIps: [{ip:"0.0.0.0",announcedIp:"127.0.0.1"}],
        enableUdp:true,
        enableTcp:true,
        preferUdp:true
      });
      peers.get(socket.id).recvTransports.set(rcvTransport.id,rcvTransport);
      console.log("This is room",room);

      //send parameters to client 

      callback(
        {
          id : rcvTransport.id,
          iceParameters: rcvTransport.iceParameters,
          iceCandidates: rcvTransport.iceCandidates,
          dtlsParameters: rcvTransport.dtlsParameters,
        }
      )

  })
  socket.on("consume",async({roomId,producerId,rtpCapabilities,transportId},callback)=>{
    const peer =  room.peers.get(socket.id);
    const transport = peer.recvTransports.get(transportId);

    const consumer = await  transport.consume({
      producerId,
      rtpCapabilities,
      paused:true,
    })
    peer.consumers.set(consumer.id,consumer);
    await consumer.resume();
    consumer.on("transportclose",()=>{
      peer.consumers.delete(consumer.id);
    })

     callback({
      id:consumer.id,
      kind:consumer.kind,
      rtpParameters:consumer.rtpParameters
    
  })
  })
 
  socket.on("disconnect",(socket)=>{
console.log("disconnected soket id",socket.id);
})
})


server.listen(3000,()=>{
  console.log("servere listen to the 3000 port");
})