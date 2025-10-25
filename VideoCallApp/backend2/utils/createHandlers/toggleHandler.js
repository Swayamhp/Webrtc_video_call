import { getRoomByroomId } from "../room.js";

export function toggleHandler(socket){
  socket.on("toggle-click",({roomId,producerId,data})=>{
    const peers= getRoomByroomId(roomId)?.peers;
    for(const [socketId] of peers){
      socket.to(socketId).emit("toggle-click",{roomId,producerId,data});
    } 

  })
}
