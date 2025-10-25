import { getProducerLists, getRoomByroomId, createRoom, createPeer, removePeer,handleStopScreenShare, notifyProducerclosed, handleDisconnectAll, screenShareProducerId } from "./room.js"
import { handleSendTransportCamera, handleRcvTransportCamera, handleConnectTransportCamera,handleSendTransportScreen, handleRcvTransportScreen, handleConnectTransportScreen } from "./createHandlers/transportHandler.js"
import { produceHandler } from "./createHandlers/producerHandler.js";
import { consumeHandler } from "./createHandlers/consumerHandler.js";
import { toggleHandler } from "./createHandlers/toggleHandler.js";

function handleSocket(io, socket) {
  socket.on("join-room", async ({ roomId }, callback) => {
    let room = getRoomByroomId(roomId);
    if (!room?.router) {
      await createRoom(roomId);
      room = getRoomByroomId(roomId);

    }
    const router = room?.router;
    if (!room.peers?.has(socket.id)) {
      room.peers.set(socket.id, createPeer(socket.id));
    }
    try {

      const producerList = getProducerLists();
      for (const producer of producerList) {
        socket.emit("consume-all-producer", { producer })
      }
// Send to new user joined the screen share
if(screenShareProducerId){
      socket.emit("newScreenShare",{producerId:screenShareProducerId});

}
    
      callback({ roomId, rtpCapabilities: router.rtpCapabilities });
      socket.on("disconnect", () => {
        console.log("disconnected soket id", socket.id);
        notifyProducerclosed(roomId, socket);
        handleDisconnectAll(roomId, socket.id);
        // cleanObjectAfterDisconnect(socket.id,roomId);
        removePeer(roomId, socket.id);
        //clear the object from consumers that are not active
      })
    } catch (error) {
      console.log(error);
    }


  })
  handleConnectTransportCamera(socket);
  handleSendTransportCamera(socket);
  handleRcvTransportCamera(socket);
  handleConnectTransportScreen(socket);
  handleSendTransportScreen(socket);
  handleRcvTransportScreen(socket);
  produceHandler(io, socket);
  consumeHandler(socket);
  toggleHandler(socket);
  handleStopScreenShare(socket);

  

}
export { handleSocket };
