import * as mediaSoup from "mediasoup"

const room = {
  id:"main-room",
  router: null,
  peers: new Map()
};
const producerList = [];
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
 export let screenShareProducerId = null;
function setScreenProducerId(producerId){
  screenShareProducerId = producerId;
}

async function createRoom(roomId){
const worker = await mediaSoup.createWorker();
const router = await  worker.createRouter({mediaCodecs});
room.router = router;
room.id = roomId;

}
function createPeer(socketId){
  return {
    id:socketId,
    sendTransport: new Map(),                 // {camera : transport,screen: transport}
    recvTransports: new Map(),
    producers: new Map(),
    consumers: new Map()
  }
}
function getRoomByroomId(roomId){
  if(roomId == room.id){
    return room;
  }
}
function getProducerLists(){
  return producerList;
}
function removePeer(roomId,socketId){
  const room = getRoomByroomId(roomId);
  const peer = room.peers;
  if(!peer.get(socketId))return;
  // peer.producers.clear();
  // peer.consumers.clear();
  // peer.recvTransports.clear();
  room.peers.delete(socketId);

}
function  handleDisconnectAll(roomId,socketId){
  const room = getRoomByroomId(roomId);
  const peer = room.peers.get(socketId);

  try{
    peer.sendTransport.get("camera").close();
    for(const [recvId,reciverTransport] of peer.recvTransports.entries()){
      reciverTransport.close();
      deleteTheDatafromPeeers(roomId,recvId,"recvtransport")
    }
    for(const [producerId,producer] of peer.producers.entries()){
      producer.close();
      deleteTheDatafromPeeers(roomId,producerId,"producer");
    }
    for(const [ consumerId,consumer] of peer.consumers.entries()){
      consumer.close();
      deleteTheDatafromPeeers(roomId,consumerId,"consumer");
    }

  }catch(error){
    console.log(
      error.message
    );
  }
  
}
function deleteTheDatafromPeeers(roomId,deleteId,type){
  const room = getRoomByroomId(roomId);
  const peers = room.peers;
  for(const [peerId,peer] of peers.entries()){
    
    if(type === "recvtransport" && peer.recvTransports.has(deleteId)){
      peer.recvTransports.delete(deleteId);
     }
    else if(type === "producer" && (peer.producers.has(deleteId) || producerList.includes(deleteId))){
      peer.producers.delete(deleteId);
     for (let i = 0; i < producerList.length; i++) {
  if (producerList[i] === deleteId) {
    producerList.splice(i, 1);
    break; // stop after deleting the first match
  }
}


      
    }else if(type == "consumer" && peer.consumers.has(deleteId)){
      peer.consumers.delete(deleteId);

    }
}
}
function notifyProducerclosed(roomId,socket){
  const room = getRoomByroomId(roomId);
  const id = socket.id;
  const peers = room.peers;
  const producerId =[...peers.get(id).producers.keys()] ;
      console.log("This is from producer closed @@@@@@@@@@@@@@@@@@@@@@@@@@@@@",producerId);

  for(const [othersocktId,peer] of peers.entries()){
    console.log("This is from producer closed @@@@@@@@@@@@@@@@@@@@@@@@@@@@@",producerId);
    socket.to(othersocktId).emit("producer-closed",producerId[0]);
  }
}
function handleStopScreenShare(socket){
  socket.on("screenshare-stopped",({roomId,producerId})=>{
    console.log("The roomId and producer id***********",roomId,producerId);
    try{
      const room = getRoomByroomId(roomId);
      const peer = room.peers.get(socket.id);
      peer.sendTransport.get('screen').close();
      setScreenProducerId(null);
      
        for(const [otherSocket,peer] of room.peers){
          console.log("This other socket id",producerId);
          if(socket.id === otherSocket) continue;
          socket.to(otherSocket).emit("screenshare-stopped",{roomId,producerId});
        
      }

    }catch(error){
      console.log(error)
    }

  })
}


export {getProducerLists,getRoomByroomId,createRoom,createPeer,handleStopScreenShare,removePeer,notifyProducerclosed,handleDisconnectAll,deleteTheDatafromPeeers,setScreenProducerId};