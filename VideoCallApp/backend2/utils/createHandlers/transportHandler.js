import {getRoomByroomId} from "../room.js"


export function handleSendTransportCamera(socket){
    socket.on("createSendTransportCamera",async ({roomId},callback)=>{
    try{
      const room = getRoomByroomId(roomId);
      const router =room.router;
    const peers = room.peers;
      const sendTransport = await  router.createWebRtcTransport({
        listenIps: [{ip:"0.0.0.0",announcedIp:"127.0.0.1"}],
        enableUdp:true,
        enableTcp:true,
        preferUdp:true
      });
      peers.get(socket.id).sendTransport.set("camera",sendTransport) ;
      console.log("This is peers send transport ********",peers.get(socket.id).sendTransport);


      //send parameters to client 
      // Monitor transport state on server side
      sendTransport.on("close",()=>{
        console.log("send transport closed");
        room.peers.delete(socket.id);
      })

      callback(
        {
          id : sendTransport.id,
          iceParameters: sendTransport.iceParameters,
          iceCandidates: sendTransport.iceCandidates,
          dtlsParameters: sendTransport.dtlsParameters,
        }
      )

    }catch(error){
      console.log(error.message);
    }
    
  })
 
}
export function handleRcvTransportCamera(socket){
  socket.on("createRcvTransportCamera",async({roomId},callback)=>{
    try{
          console.log("create recv transport***************",roomId);

      const room = getRoomByroomId(roomId);
    const router = room.router;
    const peers = room.peers;
      const rcvTransport = await router.createWebRtcTransport({
        listenIps: [{ip:"0.0.0.0",announcedIp:"127.0.0.1"}],
        enableUdp:true,
        enableTcp:true,
        preferUdp:true
      });
      peers.get(socket.id).recvTransports.set(rcvTransport.id,rcvTransport);

      //send parameters to client
      //handle to remove the transport when close

      callback(
        {
          id : rcvTransport.id,
          iceParameters: rcvTransport.iceParameters,
          iceCandidates: rcvTransport.iceCandidates,
          dtlsParameters: rcvTransport.dtlsParameters,
        }
      )
    }catch(error){
      console.log(error.message);
    }


  })
}

export function handleConnectTransportCamera(socket){
    socket.on("connectTransportCamera",async({transportId,roomId,dtlsParameters,direction},callback)=>{
     try{
      const room = getRoomByroomId(roomId);
    const peers = room.peers;
    if(!transportId)throw new Error("Transport id not defined");
    if(!dtlsParameters)throw new Error("Dtls not provided");
    if(!direction) throw new Error("Direction not provided");
   
    //  console.log("Transport id,roomId,dtlsParameter,direction",transportId,roomId,dtlsParameters,direction)
    let transport;
      if(direction==="produce"){
        console.log("This is produce")
             transport = peers.get(socket.id).sendTransport.get("camera");

     }
     else if(direction === "consume"){
      console.log("This is consume");
       transport = peers.get(socket.id).recvTransports.get(transportId);
     }transport.on("connectionstatechange",(state)=>{
 console.log("This tansport state",state);
       })

       await transport.connect({dtlsParameters});
       


    callback({connected:true})
    }catch(error){
      console.log("This is error message",error.message);
    }
  })
}
export function handleSendTransportScreen(socket){
    socket.on("createSendTransportScreen",async ({roomId},callback)=>{
    try{
      const room = getRoomByroomId(roomId);
      const router =room.router;
    const peers = room.peers;
      const sendTransport = await  router.createWebRtcTransport({
        listenIps: [{ip:"0.0.0.0",announcedIp:"127.0.0.1"}],
        enableUdp:true,
        enableTcp:true,
        preferUdp:true
      });
      peers.get(socket.id).sendTransport.set("screen",sendTransport) ;
      console.log("This is peers send transport ******** screen",peers.get(socket.id).sendTransport);


      //send parameters to client 
      // Monitor transport state on server side
      sendTransport.on("close",()=>{
        console.log("send transport closed");
        room.peers.delete(socket.id);
      })

      callback(
        {
          id : sendTransport.id,
          iceParameters: sendTransport.iceParameters,
          iceCandidates: sendTransport.iceCandidates,
          dtlsParameters: sendTransport.dtlsParameters,
        }
      )

    }catch(error){
      console.log(error.message);
    }
    
  })
 
}
export function handleRcvTransportScreen(socket){
  socket.on("createRcvTransportScreen",async({roomId},callback)=>{
    try{
          console.log("create recv transport***************",roomId);

      const room = getRoomByroomId(roomId);
    const router = room.router;
    const peers = room.peers;
      const rcvTransport = await router.createWebRtcTransport({
        listenIps: [{ip:"0.0.0.0",announcedIp:"127.0.0.1"}],
        enableUdp:true,
        enableTcp:true,
        preferUdp:true
      });
      peers.get(socket.id).recvTransports.set(rcvTransport.id,rcvTransport);

      //send parameters to client
      //handle to remove the transport when close

      callback(
        {
          id : rcvTransport.id,
          iceParameters: rcvTransport.iceParameters,
          iceCandidates: rcvTransport.iceCandidates,
          dtlsParameters: rcvTransport.dtlsParameters,
        }
      )
    }catch(error){
      console.log(error.message);
    }


  })
}

export function handleConnectTransportScreen(socket){
    socket.on("connectTransportScreen",async({transportId,roomId,dtlsParameters,direction},callback)=>{
     try{
      const room = getRoomByroomId(roomId);
    const peers = room.peers;
    if(!transportId)throw new Error("Transport id not defined");
    if(!dtlsParameters)throw new Error("Dtls not provided");
    if(!direction) throw new Error("Direction not provided");
   
    //  console.log("Transport id,roomId,dtlsParameter,direction",transportId,roomId,dtlsParameters,direction)
    let transport;
      if(direction==="produce"){
        console.log("This is produce")
             transport = peers.get(socket.id).sendTransport.get("screen");

     }
     else if(direction === "consume"){
      console.log("This is consume");
       transport = peers.get(socket.id).recvTransports.get(transportId);
     }transport.on("connectionstatechange",(state)=>{
 console.log("This tansport state",state);
       })

       await transport.connect({dtlsParameters});
       


    callback({connected:true})
    }catch(error){
      console.log("This is error message",error.message);
    }
  })
}