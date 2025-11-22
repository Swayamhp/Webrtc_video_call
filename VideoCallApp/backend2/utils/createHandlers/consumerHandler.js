import {getRoomByroomId} from "../room.js"

export function consumeHandler(socket){
   socket.on("consume-camera",async({roomId,producerId,rtpCapabilities,transportId},callback)=>{
    console.log("This is inside theconsume****************",roomId,producerId,transportId);
    try{ 
      const room = getRoomByroomId(roomId);
   const peer =  room.peers.get(socket.id);
    const transport = peer.recvTransports.get(transportId);
  
    const consumer = await  transport.consume({
      producerId,
      rtpCapabilities,
      paused:true,
    });

    peer.consumers.set(consumer.id,consumer);
    await consumer.resume();
   
  //  io.to(socket.id).emit("consumer-disconnected")


     callback({
      id:consumer.id,
      kind:consumer.kind,
      rtpParameters:consumer.rtpParameters
    
  })
    }catch(error){
      console.log(error.message);
    }
 
    
  })
   socket.on("consume-screen",async({roomId,producerId,rtpCapabilities,transportId},callback)=>{
    console.log("This is inside theconsume****************");
    try{ 
      const room = getRoomByroomId(roomId);
   const peer =  room.peers.get(socket.id);
    const transport = peer.recvTransports.get(transportId);
    const consumer = await  transport.consume({
      producerId,
      rtpCapabilities,
      paused:true,
    });

    peer.consumers.set(consumer.id,consumer);
    await consumer.resume();
   
  //  io.to(socket.id).emit("consumer-disconnected")


     callback({
      id:consumer.id,
      kind:consumer.kind,
      rtpParameters:consumer.rtpParameters
    
  })
    }catch(error){
      console.log(error.message);
    }
 
    
  })

}