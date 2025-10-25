import {getProducerLists,getRoomByroomId, setScreenProducerId} from "../room.js"

function deleteProducer(producerId,roomId,socketId){
  try{
    const room = getRoomByroomId(roomId);
    const producers = room.peers.get(socketId).producers;
    producers.delete(producerId);

  }catch(error){
    console.log(error.message)
  }
}

export function produceHandler(io,socket){
   socket.on("produce-camera",async ({kind,rtpParameters,roomId},callback)=>{
  
    try{
      console.log("Tis is inside the producer**********");
      const room = getRoomByroomId(roomId);
      const peers = room.peers;
      const transport = peers.get(socket.id).sendTransport.get('camera');     
    
      const producer = await transport.produce({kind,rtpParameters});
      peers.get(socket.id).producers.set(producer.id,producer);
      
      callback({id:producer.id});
      //Notify all sockets to that producer has given
      const producerList = getProducerLists();
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
    producer.on("close",()=>{
      peers.get(socket.id).producers.delete(producer.id);
    })
    }
    catch(error){
      console.log(error);
    }

    
  })
   socket.on("produce-screen",async ({kind,rtpParameters,roomId},callback)=>{
  
    try{
      console.log("Tis is inside the producer**********");
      const room = getRoomByroomId(roomId);
      const peers = room.peers;
      const transport = peers.get(socket.id).sendTransport.get('screen');     
    
      const producer = await transport.produce({kind,rtpParameters});
      peers.get(socket.id).producers.set(producer.id,producer);
      
      callback({id:producer.id});
      //Notify all sockets to that producer has given
      // const producerList = getProducerLists();
      //  producerList.push({producerId:producer.id,producerSocketId:socket.id,kind:producer.kind});
        setScreenProducerId(producer.id);
      for( const [otherSocket,peer] of peers){
        // console.log("This is socket id",otherSocket);
        // console.log('This is peer',peer);
        if(otherSocket === socket.id)continue;
        io.to(otherSocket).emit("newScreenShare",{
          producerId:producer.id,
          producerSocketId:socket.id,
          kind:producer.kind,
        })
      }
    producer.on("close",()=>{
      peers.get(socket.id).producers.delete(producer.id);
    })
    }
    catch(error){
      console.log(error);
    }

    
  })

}