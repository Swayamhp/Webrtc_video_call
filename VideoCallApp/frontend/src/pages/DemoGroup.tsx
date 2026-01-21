import { Device } from "mediasoup-client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import VideoConnectLogo from "../components/VideoConnectLogo";
import { FiShare2, FiCopy, FiSettings, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiMaximize } from "react-icons/fi";
const GroupVideoCall = () => {
  const socketRef = useRef<Socket | null>(null);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState('Hara_123');
  const [localMediaStarted, setLocalMediaStarted] = useState(false);
  const localMediaRef = useRef<HTMLVideoElement | null>(null)
  const localScreeSharingRef = useRef<HTMLVideoElement | null>(null);
  const localScreenSharingStreamRef = useRef<MediaStream | null>(null)
  const deviceRef = useRef<Device | null>(null);
  const localMediaStreamRef = useRef<MediaStream | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const hasConnected = useRef(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [producerId, setProducerId] = useState(null);
  let screenShareProducerId = useRef(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isShareScreenStarted, setScreenShareStarted] = useState(false);
  let remoteScreenShareStream = useRef<MediaStream>(null);




  useEffect(() => {
    if (hasConnected.current === true) return;
    hasConnected.current = true;

    const socket = io("http://localhost:3000", {
      transports: ['websocket'],
      timeout: 10000,
      reconnectionAttempts: 5,
      reconnection: true,
      reconnectionDelay: 1000
    })
    socket.on("connect", () => {
      console.log("connection signaling server!");

    })

    socketRef.current = socket;

    socketRef.current.emit("join-room", { roomId: currentRoomId }, async (data: any) => {
      const device = new Device();
      setCurrentRoomId(data.roomId);
      if (!device.loaded) {
        await device.load({ routerRtpCapabilities: data.rtpCapabilities });
        deviceRef.current = device;
        console.log("This is rtp", deviceRef.current.rtpCapabilities)
        console.log("can produce audio ", device.canProduce("video"))
        console.log("can produce audio ", device.canProduce("audio"))
      }



    })

  }, [])
  //toggle useeffect
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("toggle-click", ({ roomId, producerId, data }) => {
        console.log("This is room id and producer id and data", roomId, producerId, data);
        if (data === 'audio-off') {
          const micEle = document.getElementById(`wrapper-${producerId}`)?.querySelector(".mic-icon");
          console.log("This is audio of *******************", micEle)
          if (micEle) {
            micEle.innerHTML = '';
            micEle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"
     width="24" height="24"
     viewBox="0 0 24 24"
     fill="currentColor"
     class="icon icon-tabler icons-tabler-filled icon-tabler-microphone-off">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M3 3a1 1 0 0 1 1.707 -.707l16 16a1 1 0 0 1 -1.414 1.414l-2.486 -2.486a7.967 7.967 0 0 1 -4.807 1.779v2h3a1 1 0 0 1 0 2h-8a1 1 0 0 1 0 -2h3v-2.062a8.002 8.002 0 0 1 -7 -7.938a1 1 0 0 1 2 0a6 6 0 0 0 6 6a5.97 5.97 0 0 0 3.98 -1.48l-1.49 -1.49a4 4 0 0 1 -6.49 -3.03v-2a1 1 0 0 1 2 0v2a2 2 0 0 0 3.354 1.464l-6.354 -6.354z" />
  <path d="M15 11.264v-7.264a4 4 0 0 0 -6.616 -2.828a1 1 0 0 0 1.232 1.568a2 2 0 0 1 3.384 1.26v5.264l1.49 1.49a4.02 4.02 0 0 0 .51 -1.49z" />
</svg>
`
          }

        } else if (data === "audio-on") {
          const micEle = document.getElementById(`wrapper-${producerId}`)?.querySelector(".mic-icon");
          if (micEle) {
            micEle.innerHTML = '';
            micEle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-microphone"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19 9a1 1 0 0 1 1 1a8 8 0 0 1 -6.999 7.938l-.001 2.062h3a1 1 0 0 1 0 2h-8a1 1 0 0 1 0 -2h3v-2.062a8 8 0 0 1 -7 -7.938a1 1 0 1 1 2 0a6 6 0 0 0 12 0a1 1 0 0 1 1 -1m-7 -8a4 4 0 0 1 4 4v5a4 4 0 1 1 -8 0v-5a4 4 0 0 1 4 -4" /></svg>'
          }


        }
        else if (data === "video-off") {
          const overLayerEle = document.getElementById(`overlayer-${producerId}`);
          if (overLayerEle) {
            overLayerEle.classList.remove("hidden");
          }
        } else if (data === "video-on") {
          const overLayerEle = document.getElementById(`overlayer-${producerId}`);

          if (overLayerEle) {
            overLayerEle.classList.add("hidden");
          }
        }
      })
      // socketRef.current.on("consume-all-producer",()=>{
      //   setClientCount(count=>count+1);
      // })
    }
  }, [])

  useEffect(() => {
    if (socketRef.current && buttonClicked) {
      if (deviceRef.current?.loaded) {
        startCameraAudio()
      }
    }

  }, [buttonClicked])
  let checkProducerComing = useRef(false)
  useEffect(() => {
    if (checkProducerComing.current == true) return;
    checkProducerComing.current = true;
    socketRef.current?.on("consume-all-producer", ({ producer }) => {
      console.log("Console all producers are:", producer);
      async function reciveTransportFun() {
        await reciveTransportCamera(currentRoomId, producer.producerId);
      }
      reciveTransportFun();

    })

  }, [hasConnected])
  useEffect(() => {
    if (socketRef.current) {


      socketRef.current.on("producer-closed", (producerId) => {
        console.log("The producer closed of socket id", producerId);
        const videoEle = document.getElementById(`wrapper-${producerId}`)
        if (videoEle) {
          console.log("The video element ", videoEle);
          videoEle.remove();
          console.log("The video got deleted");
          // setClientCount(cnt=>cnt-1);
        }

      }
      )
      socketRef.current.on("screenshare-stopped", () => {
        setIsScreenSharing(false);

      })
    }

  }, [])



  const newProducerListenAdded = useRef(false);
  useEffect(() => {
    if (newProducerListenAdded.current) return;
    newProducerListenAdded.current = true;

    socketRef.current?.on("newProducer", async ({ producerId, producerSocketId, kind }) => {
      console.log("This is producerid,socketid,kind", producerId, producerSocketId, kind);

      await reciveTransportCamera(currentRoomId, producerId);
    })

    socketRef.current?.on("newScreenShare", async ({ producerId, producerSocketId, kind }) => {
      console.log("This is producerid,socketid,kind", producerId, producerSocketId, kind);
      await reciveTransportScreen(currentRoomId, producerId);
    })


  }, [deviceRef.current]);



  async function reciveTransportScreen(currentRoomId: any, producerId: any) {
    return new Promise((resolve) => {
      socketRef.current?.emit("createRcvTransportScreen", { roomId: currentRoomId }, (data: any) => {
        console.log("getting data************", data)
        const transport = deviceRef.current?.createRecvTransport(data)

        transport?.on("connect", ({ dtlsParameters }, callback, errback) => {
          socketRef.current?.emit("connectTransportScreen", { roomId: currentRoomId, transportId: transport.id, dtlsParameters, direction: "consume" }, (response: any) => {
            if (response.error) return errback(response.error);
            callback();
          })

        })
        socketRef.current?.emit("consume-screen", {
          roomId: currentRoomId,
          producerId,
          rtpCapabilities: deviceRef.current?.rtpCapabilities,
          transportId: transport?.id
        }, async (res: any) => {
          const { id, kind, rtpParameters } = res;
          if (!transport) return console.log("transpot not defined");
          const consumer = await transport.consume({
            id,
            producerId,
            kind,
            rtpParameters,

          })

          transport?.on("connectionstatechange", (state) => {
            console.log("consumer state connected**************890", state);
            if (state === "closed" || state === "failed") {
              setIsScreenSharing(false);
            }


          })

          console.log("consumers info", consumer.closed);



          const stream = new MediaStream();
          stream.addTrack(consumer.track);


          remoteScreenShareStream.current = stream;
          setIsScreenSharing(true);
          // if(localScreeSharingRef.current){
          //   console.log("The screen sharing element ",localScreeSharingRef.current);
          //             localScreeSharingRef.current.srcObject = stream;
          //             localScreeSharingRef.current?.play()
          //           setScreenShareStarted(true);
          // }

          //           const wrapperVideoEle = document.createElement("div");
          //           wrapperVideoEle.id = `wrapper-${producerId}`
          //           wrapperVideoEle.classList.add("wrapper-video");
          //           //video Ele
          //           const videoEle = document.createElement("video");
          //           videoEle.id = `producer-${producerId}`
          //           videoEle.srcObject = stream;
          //           videoEle.autoplay = true;
          //           videoEle.playsInline = true;
          //           videoEle.muted = true;
          //           videoEle.classList.add("video-css");

          //           // Mic icon 
          //           const micIconEle = document.createElement("div");
          //           micIconEle.classList.add("mic-icon");
          //           micIconEle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-microphone"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19 9a1 1 0 0 1 1 1a8 8 0 0 1 -6.999 7.938l-.001 2.062h3a1 1 0 0 1 0 2h-8a1 1 0 0 1 0 -2h3v-2.062a8 8 0 0 1 -7 -7.938a1 1 0 1 1 2 0a6 6 0 0 0 12 0a1 1 0 0 1 1 -1m-7 -8a4 4 0 0 1 4 4v5a4 4 0 1 1 -8 0v-5a4 4 0 0 1 4 -4" /></svg>
          // `
          //           //Overlayer for video off 
          //           const videoOverLayerEle = createVideoOffOverlayer(producerId);
          //           wrapperVideoEle.appendChild(videoEle);
          //           wrapperVideoEle.appendChild(micIconEle);
          //           wrapperVideoEle.appendChild(videoOverLayerEle);



          //           if (videoContainerRef.current) {
          //             videoContainerRef.current.appendChild(wrapperVideoEle);
          //             try {
          //               await videoEle.play(); // ensures video plays
          //             } catch (err) {
          //               console.error("Error playing video:", err);
          //             }
          //           }


        })

        resolve(transport);
      })
    })
  }
  async function reciveTransportCamera(currentRoomId: any, producerId: any) {
    return new Promise((resolve) => {
      socketRef.current?.emit("createRcvTransportCamera", { roomId: currentRoomId }, (data: any) => {
        console.log("This data", data);
        const transport = deviceRef.current?.createRecvTransport(data)
        //connect transport 
        transport?.on("connectionstatechange", (state) => {
          console.log("This connection state is camera***************", state);
        })

        transport?.on("connect", ({ dtlsParameters }, callback, errback) => {
          console.log("Ready for reciving camera", dtlsParameters);
          socketRef.current?.emit("connectTransportCamera", { roomId: currentRoomId, transportId: transport.id, dtlsParameters, direction: "consume" }, (response: any) => {
            if (response.error) return errback(response.error);
            callback();
          })

        })
        console.log('After reciving transport********', currentRoomId, producerId, deviceRef.current?.rtpCapabilities, transport?.id)
        socketRef.current?.emit("consume-camera", {
          roomId: currentRoomId,
          producerId,
          rtpCapabilities: deviceRef.current?.rtpCapabilities,
          transportId: transport?.id
        }, async (res: any) => {
          const { id, kind, rtpParameters } = res;
          if (!transport) return console.log("transpot not defined");
          const consumer = await transport.consume({
            id,
            producerId,
            kind,
            rtpParameters,

          })
          transport?.on("connectionstatechange", (state) => {
            console.log("consumer state connected**************8", state);


          })

          console.log("consumers info", consumer.closed);



          const stream = new MediaStream();
          stream.addTrack(consumer.track);


          // Create wrapper with EXACT same classes as local video
          const wrapperVideoEle = document.createElement("div");
          wrapperVideoEle.id = `wrapper-${producerId}`
          wrapperVideoEle.className = "relative rounded-xl overflow-hidden bg-gray-800 aspect-video min-h-[200px] group border-2 border-gray-600 hover:border-blue-400 transition-all duration-300 shadow-lg";

          // Video element with same styling as local video
          const videoEle = document.createElement("video");
          videoEle.id = `producer-${producerId}`
          videoEle.srcObject = stream;
          videoEle.autoplay = true;
          videoEle.playsInline = true;
          videoEle.muted = true; // Changed to false to hear remote audio
          videoEle.className = "w-full h-full object-cover rounded-xl";

          // User label - exactly like local but with different text
          const userLabelEle = document.createElement("div");
          userLabelEle.className = "absolute bottom-3 left-3 text-white text-sm bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2";
          userLabelEle.innerHTML = `
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span class="font-medium">User ${producerId.slice(-4)}</span>
        `;

          // Audio indicator - initially showing mic on (same as local)
          const audioIndicatorEle = document.createElement("div");
          audioIndicatorEle.className = "absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-full p-2 shadow-lg mic-icon";
          audioIndicatorEle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-white">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M19 9a1 1 0 0 1 1 1a8 8 0 0 1 -6.999 7.938l-.001 2.062h3a1 1 0 0 1 0 2h-8a1 1 0 0 1 0 -2h3v-2.062a8 8 0 0 1 -7 -7.938a1 1 0 1 1 2 0a6 6 0 0 0 12 0a1 1 0 0 1 1 -1m-7 -8a4 4 0 0 1 4 4v5a4 4 0 1 1 -8 0v-5a4 4 0 0 1 4 -4" />
          </svg>
        `;

          // Video off overlay (hidden by default) - same as local
          const videoOverLayerEle = document.createElement("div");
          videoOverLayerEle.id = `overlayer-${producerId}`
          videoOverLayerEle.className = "absolute inset-0 bg-gray-900/90 flex items-center justify-center hidden rounded-xl";
          videoOverLayerEle.innerHTML = `
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="text-white opacity-70 mx-auto mb-2" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M10.961 12.365a2 2 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518zM1.428 4.18A1 1 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634zM15 11.73l-3.5-1.555v-4.35L15 4.269zm-4.407 3.56-10-14 .814-.58 10 14z"/>
            </svg>
            <div class="text-white text-sm font-medium">Camera Off</div>
          </div>
        `;

          // Hover effect gradient - same as local
          const hoverGradientEle = document.createElement("div");
          hoverGradientEle.className = "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl";

          // Append all elements in same structure as local
          wrapperVideoEle.appendChild(videoEle);
          wrapperVideoEle.appendChild(userLabelEle);
          wrapperVideoEle.appendChild(audioIndicatorEle);
          wrapperVideoEle.appendChild(videoOverLayerEle);
          wrapperVideoEle.appendChild(hoverGradientEle);


          if (videoContainerRef.current) {
            videoContainerRef.current.appendChild(wrapperVideoEle);
            try {
              await videoEle.play(); // ensures video plays
            } catch (err) {
              console.error("Error playing video:", err);
            }
          }


        })

        resolve(transport);
      })
    })
  }
  useEffect(() => {
    if (localMediaStarted && deviceRef.current) {
      socketRef.current?.emit("createSendTransportCamera", { roomId: currentRoomId }, async (params: any) => {
        //creating the sendTransport 
        const sendTransport = deviceRef.current?.createSendTransport(params);
        // Wait a bit for event listeners to be registered
        console.log("Transparent", sendTransport);

        sendTransport?.on("connect", async ({ dtlsParameters }, callback, errback) => {

          socketRef.current?.emit("connectTransportCamera", { transportId: sendTransport.id, dtlsParameters, roomId: currentRoomId, direction: "produce" }, (response: any) => {
            if (response?.error) return errback(response?.error);
            console.log(response);
            console.log("Return call back of connectTransport");
            callback();
          })

        })


        sendTransport?.on("produce", (params) => {
          console.log("The producing started!!!", params);
          socketRef.current?.emit("produce-camera", { kind: params.kind, rtpParameters: params.rtpParameters, roomId: currentRoomId }, (callback: any) => {
            console.log("callback success", callback);
            setProducerId(callback.id)

          })
        })
        // Wait a bit for event listeners to be registered
        sendTransport?.on("connectionstatechange", async (state) => {
          console.log("This is state of transport *******************************8", state)
          if (state === "connected") {
          }
        })
        console.log("This is connection sate", sendTransport?.connectionState)
        await produceTransport(sendTransport);
      }
      )

    }

  }, [localMediaStarted])
  useEffect(() => {
    if (isShareScreenStarted) {
      socketRef.current?.emit("createSendTransportScreen", { roomId: currentRoomId }, async (params: any) => {
        //creating the sendTransport 
        const sendTransportScreen = deviceRef.current?.createSendTransport(params);
        // Wait a bit for event listeners to be registered
        console.log("Transparent", sendTransportScreen);

        sendTransportScreen?.on("connect", async ({ dtlsParameters }, callback, errback) => {

          socketRef.current?.emit("connectTransportScreen", { transportId: sendTransportScreen.id, dtlsParameters, roomId: currentRoomId, direction: "produce" }, (response: any) => {
            if (response?.error) return errback(response?.error);
            console.log(response);
            console.log("Return call back of connectTransport");
            callback();
          })

        })


        sendTransportScreen?.on("produce", (params) => {
          console.log("The producing started!!!", params);
          socketRef.current?.emit("produce-screen", { kind: params.kind, rtpParameters: params.rtpParameters, roomId: currentRoomId }, (callback: any) => {
            console.log("callback success", callback.id);
            screenShareProducerId.current = callback.id;

          })
        })
        // Wait a bit for event listeners to be registered
        sendTransportScreen?.on("connectionstatechange", async (state) => {
          console.log("This is state of transport *******************************8", state)
          if (state === "connected") {
          }
        })
        console.log("This is connection sate", sendTransportScreen?.connectionState)
        await produceTransportForScreenSharing(sendTransportScreen);
      }
      )

    }

  }, [isShareScreenStarted])
  useEffect(() => {
    if (isScreenSharing && localScreeSharingRef.current && remoteScreenShareStream.current) {
      console.log("This is screen sharing *******************")
      localScreeSharingRef.current.srcObject = remoteScreenShareStream.current;
      localScreenSharingStreamRef.current = remoteScreenShareStream.current;
      localScreeSharingRef.current.muted = true;
      setScreenShareStarted(true);
      localScreeSharingRef.current.play();
    }



  }, [isScreenSharing])



  async function produceTransport(transport: any) {
    const videoTrack = localMediaStreamRef.current?.getVideoTracks()[0];
    const audioTrack = localMediaStreamRef.current?.getAudioTracks()[0];
    try {
      await transport.produce({ track: videoTrack, appData: { roomId: currentRoomId } });

      await transport.produce({ track: audioTrack, appData: { roomId: currentRoomId } });

    } catch (error) {
      console.log('This is some error in producer ', error);
    }

  }

  async function startCameraAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      setLocalMediaStarted(true);
      localMediaStreamRef.current = stream;
      if (localMediaRef.current) {
        localMediaRef.current.srcObject = stream;
        await localMediaRef.current.play()
      }

    } catch (error) {
      console.log(error)

    }
  }
  async function produceTransportForScreenSharing(transport: any) {
    if (localScreenSharingStreamRef.current) {
      const screenTrack = localScreenSharingStreamRef.current?.getVideoTracks()[0];
      await transport.produce({ track: screenTrack, appData: { roomId: currentRoomId } });
    }


  }
  async function startScreenSharing() {
    try {
      if (isScreenSharing) {
        setIsScreenSharing(false);
        localScreenSharingStreamRef.current?.getTracks().forEach((track) => track.stop());
        localScreenSharingStreamRef.current = null;
        return;
      }
      setIsScreenSharing(true);



      const screenStream = await navigator.mediaDevices.getDisplayMedia();
      if (!screenStream) return;
      localScreenSharingStreamRef.current = screenStream;
      setScreenShareStarted(true);

      const screenTrack = screenStream.getVideoTracks()[0];

      screenTrack.onended = () => {
        console.log('This is screen track ended**************', currentRoomId, screenShareProducerId.current);
        socketRef.current?.emit("screenshare-stopped", { roomId: currentRoomId, producerId: screenShareProducerId.current })
        setIsScreenSharing(false);
        setScreenShareStarted(false);
        if (localScreenSharingStreamRef.current) {
          localScreenSharingStreamRef.current.getTracks().forEach(track => track.stop());
          localScreenSharingStreamRef.current = null;
        }
        if (localScreeSharingRef.current) {
          localScreeSharingRef.current.srcObject = null;
        }
        remoteScreenShareStream.current = null;
      }
      // loclScreeSharingRef.current = stream;
      if (localScreeSharingRef.current) {
        const videoEle = localScreeSharingRef.current;
        try {
          await videoEle.pause();
          videoEle.removeAttribute("src")
          videoEle.srcObject = null;
          videoEle.load();
        } catch (error) {
          console.log(error);
        }


        videoEle.srcObject = screenStream;
        videoEle.onloadedmetadata = async () => {
          try {
            await videoEle.play()

          } catch (error) {
            console.log('Error playing video', error)
          }

        }
      }

    } catch (error) {
      console.log(error)

    }
  }

  function handleVideoToggle() {
    if (!isVideoEnabled && localMediaStreamRef.current) {
      localMediaStreamRef.current.getVideoTracks()[0].enabled = true;
      socketRef.current?.emit("toggle-click", { roomId: currentRoomId, producerId, data: "video-on" })
    } else if (isVideoEnabled && localMediaStreamRef.current) {
      localMediaStreamRef.current.getVideoTracks()[0].enabled = false;
      socketRef.current?.emit("toggle-click", { roomId: currentRoomId, producerId, data: "video-off" })

    }
    setIsVideoEnabled(!isVideoEnabled)

  }
  function handleAudioToggle() {
    if (!isAudioEnabled && localMediaStreamRef.current) {
      localMediaStreamRef.current.getAudioTracks()[0].enabled = true;
      socketRef.current?.emit("toggle-click", { roomId: currentRoomId, producerId, data: "audio-on" })

    } else if (isAudioEnabled && localMediaStreamRef.current) {
      localMediaStreamRef.current.getAudioTracks()[0].enabled = false;
      socketRef.current?.emit("toggle-click", { roomId: currentRoomId, producerId, data: "audio-off" })

    }
    setIsAudioEnabled(!isAudioEnabled);
  }

  function handleFullScreen() {
    const videoContEle = videoContainerRef.current;
    if (!document.fullscreenElement) {
      videoContEle?.requestFullscreen().catch((err) => console.log(err.message))
    } else {
      document.exitFullscreen();
    }

  }

  return (
    <div className="w-full min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex flex-row p-4 px-6 justify-between items-center border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <VideoConnectLogo width={150} height={40} />
        <div className="flex items-center gap-4">
          <div title="Share Room Url" onClick={() => { }} className="cursor-pointer p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all">
            <FiShare2 className="w-5 h-5 text-gray-300 hover:text-white transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${true ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
          </div>
          <div className="bg-gray-700 px-4 py-2 rounded-lg flex items-center border border-gray-600">
            <span className="text-gray-300 mr-2 text-sm">Room:</span>
            <span className="text-white font-mono text-sm bg-gray-800 px-2 py-1 rounded">{currentRoomId}</span>
            <button onClick={() => { }} className="ml-2 text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-400/10">
              <FiCopy className="w-4 h-4" />
            </button>
          </div>
          <div className="text-gray-400 cursor-pointer hover:text-white transition-colors p-2 rounded-lg bg-gray-700 hover:bg-gray-600" onClick={() => {
            const el = document.querySelector(".settings-icon") as HTMLElement;
            el?.classList.add("animate-spin");
            setTimeout(() => {
              el?.classList.remove("animate-spin");
            }, 500);
          }}>
            <FiSettings size={20} className="settings-icon" />
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="md:flex-1 flex-0 p-4 flex flex-col lg:flex-row gap-6">
        {/* Screen Share Area - Only visible when screen sharing */}
        {isScreenSharing && (
          <div className="lg:w-2/3 w-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white text-lg font-semibold flex items-center gap-2">
                <FiMonitor className="w-5 h-5 text-blue-400" />
                Screen Share
              </div>
              <div className="text-sm text-gray-400">Live</div>
            </div>
            <div className="bg-black rounded-xl p-2 flex-1 border border-gray-700 shadow-2xl">
              <video
                ref={localScreeSharingRef}
                className="w-full h-full rounded-lg bg-gray-900 object-contain"
                autoPlay
                playsInline
              />
            </div>
          </div>
        )}

        {/* Participants Videos */}
        <div className={`flex flex-col ${isScreenSharing ? 'lg:w-1/3 max-h-screen' : 'w-full'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-white text-lg font-semibold flex items-center gap-2">
              <div className="flex items-center gap-3">
                <span>Participants</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {!isScreenSharing && 'Grid View'}
            </div>
          </div>

          <div
            ref={videoContainerRef}
            className={`grid gap-4 flex-1 ${isScreenSharing
              ? 'flex flex-col flex-wrap  justify-center overflow-y-scroll '
              : `grid-cols-1 sm:grid-cols-2 md:grid-cols-2 ${0 > 1 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} xl:grid-cols-4 2xl:grid-cols-5`
              }`}
          >
            {/* Local Video */}
            <div className="relative rounded-xl overflow-hidden bg-gray-800 aspect-video min-h-[200px] group border-2 border-gray-600 hover:border-blue-400 transition-all duration-300 shadow-lg">
              <video
                ref={localMediaRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              {/* User label */}
              <div className="absolute bottom-3 left-3 text-white text-sm bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">You</span>
              </div>

              {/* Video off overlay */}
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-white opacity-70 mx-auto mb-2" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10.961 12.365a2 2 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518zM1.428 4.18A1 1 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634zM15 11.73l-3.5-1.555v-4.35L15 4.269zm-4.407 3.56-10-14 .814-.58 10 14z" />
                    </svg>
                    <div className="text-white text-sm font-medium">Camera Off</div>
                  </div>
                </div>
              )}

              {/* Audio indicator */}
              {!isAudioEnabled && (
                <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                  <FiMicOff className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-3">
            {/* Video Toggle */}
            <button
              onClick={handleVideoToggle}
              className={`flex flex-col items-center  p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${isVideoEnabled
                  ? "bg-gray-700 hover:bg-gray-600 text-white shadow-lg"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                }`}
            >
              {isVideoEnabled ?
                <FiVideo className="w-6 h-6" /> :
                <FiVideoOff className="w-6 h-6" />
              }
              <span className="text-xs font-medium mt-1">
                {isVideoEnabled ? "Camera On" : "Camera Off"}
              </span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleAudioToggle}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${isAudioEnabled
                  ? "bg-gray-700 hover:bg-gray-600 text-white shadow-lg"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                }`}
            >
              {isAudioEnabled ?
                <FiMic className="w-6 h-6" /> :
                <FiMicOff className="w-6 h-6" />
              }
              <span className="text-xs font-medium mt-1">
                {isAudioEnabled ? "Mic On" : "Mic Off"}
              </span>
            </button>

            {/* Join/Leave Call - Main Action Button */}
            <button
              onClick={() => setButtonClicked(!buttonClicked)}
              className={`flex flex-col items-center  px-4 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl ${buttonClicked
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/25"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/25"
                } font-semibold`}
            >
              <div className="flex items-center gap-2">
                {buttonClicked ? "Leave Call" : "Join Call"}
              </div>
              <span className="text-xs font-normal opacity-90">
                {buttonClicked ? "End meeting" : "Start video call"}
              </span>
            </button>

            {/* Screen Share */}
            <button
              onClick={startScreenSharing}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${isScreenSharing
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-700 hover:bg-gray-600 text-white shadow-lg"
                }`}
            >
              <FiMonitor className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">
                {isScreenSharing ? "Stop Share" : "Share"}
              </span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullScreen} className="flex flex-col items-center p-3 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg">
              <FiMaximize className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">Fullscreen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupVideoCall;