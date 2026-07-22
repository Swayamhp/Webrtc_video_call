# 📹 VideoConnect

<div align="center">

![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-74.5%25-3178c6?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge)
![MediaSoup](https://img.shields.io/badge/MediaSoup-SFU-orange?style=for-the-badge)

A modern, scalable real-time video conferencing application featuring both **peer-to-peer** and **group video calls**.

[🌐 Live Demo](https://videoconnecthp.netlify.app) • [📚 Documentation](#documentation) • [🚀 Get Started](#quick-start)

</div>

---

## 🎯 Overview

**VideoConnect** is a production-ready video conferencing platform built with cutting-edge web technologies. It supports seamless one-to-one video calls via WebRTC P2P and scalable group video calls using MediaSoup Selective Forwarding Unit (SFU) architecture.

> ⚠️ **Note:** The group video call backend is currently in development and running locally. The live demo demonstrates the one-to-one P2P video call functionality.

---

## ✨ Features

### Core Features
- ✅ **One-to-One Video Calls** - Direct peer-to-peer WebRTC connections
- ✅ **Group Video Calls** - Scalable SFU architecture with MediaSoup
- ✅ **Real-Time Audio/Video Streaming** - Low-latency media transmission
- ✅ **Responsive UI** - Works seamlessly on desktop and mobile devices
- ✅ **Socket.IO Integration** - Real-time signaling and notifications

### Advanced Features
- 🎨 **Modern UI/UX** - Built with React and Tailwind CSS
- 🔌 **Modular Architecture** - Easily extensible components
- 🚀 **Type-Safe** - Full TypeScript support
- 📦 **Production Ready** - Deployed on Netlify

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Frontend (TypeScript)                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐    │  │
│  │  │ Video Call │  │ UI/Layout  │  │ State Manager  │    │  │
│  │  │ Component  │  │ (Tailwind) │  │ (React Hooks)  │    │  │
│  │  └────────────┘  └────────────┘  └────────────────┘    │  │
│  │         ▲                ▲                ▲               │  │
│  └─────────┼────────────────┼────────────────┼───────────────┘  │
│            │                │                │                  │
│  ┌─────────┼────────────────┼────────────────┼───────────────┐  │
│  │  WebRTC & Communication Layer                            │  │
│  │  ┌────────────────┐              ┌─────────────────┐   │  │
│  │  │  WebRTC Peer   │◄────────────►│  Socket.IO      │   │  │
│  │  │  Connection    │              │  Client         │   │  │
│  │  └────────────────┘              └─────────────────┘   │  │
│  │         ▲                                 ▲               │  │
│  └─────────┼─────────────────────────────────┼───────────────┘  │
│            │                                 │                  │
└────────────┼─────────────────────────────────┼──────────────────┘
             │ Media Streams                    │ Signaling
             │ (Audio/Video)                   │ (Messages)
    ┌────────┴─────────────────────────────────┴────────┐
    │                 INTERNET                          │
    └────┬────────────────────────────────────────────┬─┘
         │                                            │
    ┌────▼──────────────────────────────────────────▼──────┐
    │         BACKEND SERVERS (Node.js)                    │
    │                                                      │
    │  ┌──────────────────────────────────────────────┐   │
    │  │  Backend (One-to-One P2P Signaling)         │   │
    │  │  ┌─────────────────────────────────────┐    │   │
    │  │  │  Express Server                     │    │   │
    │  │  │  - Socket.IO Server                 │    │   │
    │  │  │  - Signaling Logic                  │    │   │
    │  │  │  - User Management                  │    │   │
    │  │  └─────────────────────────────────────┘    │   │
    │  └──────────────────────────────────────────────┘   │
    │                                                      │
    │  ┌──────────────────────────────────────────────┐   │
    │  │  Backend2 (Group Video SFU)                 │   │
    │  │  ┌─────────────────────────────────────┐    │   │
    │  │  │  Express Server                     │    │   │
    │  │  │  - MediaSoup Worker                 │    │   │
    │  │  │  - SFU Logic                        │    │   │
    │  │  │  - Room Management                  │    │   │
    │  │  │  - Media Routing                    │    │   │
    │  │  └─────────────────────────────────────┘    │   │
    │  └──────────────────────────────────────────────┘   │
    │                                                      │
    └──────────────────────────────────────────────────────┘
```

### One-to-One Call Flow

```
┌─────────────┐                          ┌─────────────┐
│   User A    │                          │   User B    │
│  (Caller)   │                          │ (Callee)    │
└──────┬──────┘                          └──────┬──────┘
       │                                        │
       │ 1. Enter room                          │
       ├────────────────────────────────────────►│
       │                                        │
       │                                  2. Accept call
       │                                        │
       │ 3. Create WebRTC Offer                 │
       ├──────────────────────────────────────► │
       │                                        │
       │ 4. Create WebRTC Answer               │
       │◄──────────────────────────────────────┤
       │                                        │
       │ 5. Exchange ICE Candidates             │
       │◄───────────────────────────────────────►│
       │                                        │
       ├════════════════════════════════════════►│
       │    WebRTC Connection Established       │
       │    (Audio/Video Streaming)             │
       │◄════════════════════════════════════════┤
       │                                        │
```

### Group Call Flow (MediaSoup SFU)

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   User A    │      │   User B     │      │   User C    │
│             │      │              │      │             │
└──────┬──────┘      └──────┬───────┘      └──────┬──────┘
       │                    │                     │
       │ Join Room          │ Join Room           │ Join Room
       └────────┬───────────┼─────────────────────┘
                │           │
         ┌──────▼───────────▼────────┐
         │   MediaSoup SFU Router     │
         │                           │
         │  ┌───────────────────┐   │
         │  │ Producer/Consumer │   │
         │  │ Management        │   │
         │  └───────────────────┘   │
         │                           │
         │  ┌───────────────────┐   │
         │  │ Media Routing     │   │
         │  │ & Forwarding      │   │
         │  └───────────────────┘   │
         └──────┬───────────────────┘
                │
       ┌────────┼────────┐
       │        │        │
   ┌───▼──┐ ┌──▼───┐ ┌──▼───┐
   │ User │ │User  │ │User  │
   │  A   │ │  B   │ │  C   │
   └──────┘ └──────┘ └──────┘

   (Each user receives streams from all other users)
```

---

## 📋 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript | UI Framework & Type Safety |
| **Styling** | Tailwind CSS, Framer Motion | Responsive Design & Animations |
| **Build Tool** | Vite | Fast build & HMR |
| **Real-Time Communication** | WebRTC, Socket.IO | Signaling & Media Streaming |
| **Backend (P2P)** | Node.js, Express, Socket.IO | Signaling Server |
| **Backend (Group)** | Node.js, Express, MediaSoup | SFU Server & Media Routing |
| **Deployment** | Netlify (Frontend) | Hosting & CI/CD |

### Dependencies Overview

#### Frontend
```json
{
  "Core": ["react@19", "react-dom@19"],
  "Routing": ["react-router-dom@7"],
  "Styling": ["tailwindcss@4", "framer-motion@12"],
  "WebRTC": ["socket.io-client@4", "mediasoup-client@3"],
  "UI Components": ["lucide-react@0.545", "react-icons@4"],
  "Notifications": ["react-hot-toast@2"],
  "Build": ["typescript@5.8", "vite@7"]
}
```

#### Backend (One-to-One)
```json
{
  "Server": ["express@5", "socket.io@4"],
  "Utilities": ["cors@2.8", "dotenv@17"]
}
```

#### Backend (Group)
```json
{
  "Server": ["express@5", "socket.io@4"],
  "SFU": ["mediasoup@3"],
  "Utilities": ["cors@2.8", "uuid@13"]
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Swayamhp/Webrtc_video_call.git
cd Webrtc_video_call
```

#### 2. Frontend Setup
```bash
cd VideoCallApp/frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`

#### 3. Backend Setup (One-to-One P2P)
```bash
cd VideoCallApp/backend
npm install
npm run dev
```
Server runs on `http://localhost:3001`

#### 4. Backend Setup (Group Video - Optional)
```bash
cd VideoCallApp/backend2
npm install
node server.js
```
Server runs on `http://localhost:3000`

---

## 📁 Project Structure

```
Webrtc_video_call/
├── VideoCallApp/
│   ├── frontend/                 # React TypeScript Frontend
│   │   ├── src/
│   │   │   ├── assets/          # Images & audio
│   │   │   ├── components/     # React Components
│   │   │   ├── hooks/           # Custom React Hooks
│   │   │   ├── config/          # RTC configuration
│   │   │   ├── App.tsx          # Router
│   │   │   ├── main.tsx         # Entry point
│   │   │   └── index.css        # Tailwind + global
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig*.json
│   │
│   ├── backend/                  # P2P Signaling Server (port 3001)
│   │   ├── index.js             # Express + Socket.io server
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── backend2/                 # Mediasoup SFU Server (port 3000)
│   │   ├── server.js            # Entry point
│   │   ├── index.js             # Older version
│   │   ├── package.json
│   │   ├── doc.txt
│   │   └── utils/
│   │       ├── room.js
│   │       ├── socketHandler.js
│   │       └── createHandlers/
│   │           ├── transportHandler.js
│   │           ├── producerHandler.js
│   │           ├── consumerHandler.js
│   │           └── toggleHandler.js
│
└── README.md                     # This file
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (One-to-One) — `backend/.env`
```env
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Backend2 (Group Video) — no `.env` needed
Default port is `3000` (hardcoded in `server.js`).

#### Frontend — `frontend/.env` (optional)
```env
VITE_TURN_USERNAME=your_turn_username
VITE_TURN_CREDENTIAL=your_turn_credential
VITE_SIGNALING_SERVER_URL=http://localhost:3001
```
> Fallback TURN credentials are compiled into `config/rtcConfig.ts` for development.

---

## 🎮 Usage

### One-to-One Video Call
1. Open the live demo: https://videoconnecthp.netlify.app
2. Enter your name
3. Share the room link with another user
4. Click "Call" to initiate the video call
5. Accept the incoming call to start the session

### Group Video Call (Local Development)
1. Run all services (frontend + both backends)
2. Create or join a room
3. Multiple users can join and see all participants
4. Media is routed through the SFU for optimal performance

---

## 🌟 Key Features Explained

### WebRTC Peer-to-Peer
- Direct media streaming between two users
- No media passes through the server
- Low latency and bandwidth efficient
- Ideal for one-to-one calls

### MediaSoup SFU
- Selective Forwarding Unit architecture
- Server forwards media streams to multiple recipients
- Scalable for group calls (10-100+ participants)
- Intelligent bandwidth management

### Real-Time Signaling
- Socket.IO enables instant messaging
- Used for call invitations and control signals
- Maintains connection reliability

---

## 📡 Socket Events Reference

### Backend 1 — P2P Signaling (port 3001)

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join-room` | Client → Server | Join/create a room (max 2 users) |
| `offer` | Bidirectional | Forward WebRTC offer to other user |
| `answer` | Bidirectional | Forward WebRTC answer to other user |
| `ice-candidate` | Bidirectional | Forward ICE candidates between peers |
| `leave-room` | Client → Server | Explicitly leave a room |
| `send-message` | Client → Server | Chat message forwarding |
| `check-room` | Client → Server | Check if room exists and has space |
| `get-room-status` | Client → Server | Get room user count and states |
| `ping / pong` | Bidirectional | Connection health check |
| `user-connected` | Server → Client | Notification of new participant |
| `user-disconnected` | Server → Client | Notification of participant leaving |
| `room-full` | Server → Client | Rejection when room is at capacity |
| `room-users-update` | Server → Client | Updated user list |
| `webrtc-state` | Client → Server | Debug WebRTC state logging |

**REST Endpoints:** `GET /health`, `GET /rooms`, `DELETE /rooms`

### Backend 2 — Mediasoup SFU (port 3000)

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join-room` | Client → Server | Join room, receive router RTP capabilities |
| `createSendTransportCamera` | Client → Server | Create send transport for camera feed |
| `createSendTransportScreen` | Client → Server | Create send transport for screen share |
| `createRcvTransportCamera` | Client → Server | Create receive transport for camera |
| `createRcvTransportScreen` | Client → Server | Create receive transport for screen share |
| `connectTransportCamera` | Bidirectional | DTLS handshake for camera transport |
| `connectTransportScreen` | Bidirectional | DTLS handshake for screen transport |
| `produce-camera` | Client → Server | Produce camera audio/video tracks |
| `produce-screen` | Client → Server | Produce screen share video track |
| `consume-camera` | Client → Server | Consume a remote camera producer |
| `consume-screen` | Client → Server | Consume a remote screen share producer |
| `consume-all-producer` | Server → Client | Send all existing producers to newly joined peer |
| `newProducer` | Server → Client | Notify peers about a new camera producer |
| `newScreenShare` | Server → Client | Notify peers about a new screen share |
| `screenshare-stopped` | Client → Server | Notify when screen sharing stops |
| `producer-closed` | Server → Client | Notify that a producer was closed remotely |
| `toggle-click` | Bidirectional | Propagate mute/unmute/video on/off states |

---

## 🧩 Frontend Architecture

### Component Tree

```
App (Router)
├── LandingPage (/*)
│   ├── Header
│   ├── Hero
│   │   └── GenerateIdModal (create/join room)
│   └── Footer
│
├── VideoCallPage (/video-call/:roomId) — 1:1 P2P
│   ├── CallHeader
│   ├── VideoGrid (local + remote video, fullscreen)
│   ├── VideoControls (mic, camera, screen share, end)
│   ├── CallStatus (connection indicators)
│   ├── VideoSettingModal (resolution, backgrounds)
│   └── CallFooter
│
└── DemoGroup (/group-video-call/:roomId) — SFU Group
    ├── CallHeader
    ├── VideoGrid (dynamic per-user videos)
    ├── VideoControls
    └── CallStatus
```

### Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useWebRTCConnection` | `hooks/useWebRTCConnection.ts` | RTCPeerConnection lifecycle — create, offer/answer, ICE candidate queuing, track replacement |
| `useSocketSignaling` | `hooks/useSocketSignaling.ts` | Socket.io signaling — auto-join room, forward offer/answer/ICE, connection state |
| `useMediaStream` | `hooks/useMediaStream.ts` | Camera/mic acquisition, mute toggles, screen sharing, camera flip, resolution switching with bitrate control |
| `useBackgroundProcessing` | `hooks/useBackgroundProcessing.ts` | MediaPipe SelfieSegmentation — real-time background blur/image replacement via canvas compositing |
| `useConnectionMonitoring` | `hooks/useConnectionMonitoring.ts` | getStats() polling every 3s — packet loss, quality classification (excellent/good/poor/disconnected), TURN detection, ICE restart |
| `usePictureInPicture` | `hooks/usePictureInPicture.ts` | Browser PiP mode for non-fullscreen video |

### Key UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `VideoGrid` | `components/VideoGrid.tsx` | Layout grid with fullscreen support for local/remote video |
| `VideoControls` | `components/VideoControls.tsx` | Call control bar — mute, video toggle, screen share, camera flip, end call |
| `CallHeader` | `components/CallHeader.tsx` | In-call header — room ID, copy/share, connection indicator, settings |
| `CallStatus` | `components/CallStatus.tsx` | Status panel — signaling state, remote user status, media state, connection quality |
| `VideoSettingModal` | `components/VideoSettingModal.tsx` | Settings — layout options, resolution presets (360p–2160p), background effects (none/blur/office/beach/forest) |
| `GenerateIdModal` | `components/GenerateIdModal.tsx` | Room create/join dialog with P2P vs Group selection |

---

## 🔄 Call Flows

### One-to-One P2P (VideoCallPage)

```
User clicks "Start Call"
       │
       ▼
Socket.io connects to backend (port 3001)
       │
       ▼
useMediaStream → getUserMedia({ audio, video })
       │
       ▼
useSocketSignaling → emit("join-room", { roomId })
       │
       ▼
Server returns room status → if caller, create offer
       │
       ▼
useWebRTCConnection → new RTCPeerConnection(RTC_CONFIG)
       │
       ▼
Add local tracks → createOffer → setLocalDescription
       │
       ▼
Send offer via socket → remote peer receives
       │
       ▼
Remote peer: setRemoteDescription → createAnswer → setLocalDescription
       │
       ▼
Answer sent back → ICE candidates exchanged
       │
       ▼
───────────────────────────────────────────
TRACKS flow simultaneously:
  - local stream → local video element
  - remote stream → remote video element
  - (optional) useBackgroundProcessing intercepts
    local track → canvas with MediaPipe → new track
───────────────────────────────────────────
       │
       ▼
useConnectionMonitoring polls getStats() every 3s
  - bytes received / packets lost
  - quality classification
  - TURN relay detection
  - ICE restart on failure
```

### Group Call SFU (DemoGroup)

```
User joins room
       │
       ▼
Socket.io connects to backend2 (port 3000)
       │
       ▼
emit("join-room") → receive router RTP capabilities
       │
       ▼
new Device() → device.load({ routerRtpCapabilities })
       │
       ▼
getUserMedia → local camera + audio stream
       │
       ▼
emit("createSendTransportCamera")
  → createSendTransport(params)
  → transport.produce({ track: videoTrack })
  → transport.produce({ track: audioTrack })
       │
       ▼
Server broadcasts "newProducer" to all other peers
       │
       ▼
Each peer (including late joiners):
  emit("createRcvTransportCamera")
  → createRecvTransport
  → emit("consume-camera", { producerId })
  → transport.consume() → consumer.track
  → new MediaStream() + stream.addTrack(consumer.track)
  → create <video> element → append to video container
       │
       ▼
Screen Share (separate flow):
  getDisplayMedia() → new send transport for screen
  → transport.produce({ track: screenTrack })
  → Server emits "newScreenShare" → other peers
  → create recv transport + consume → display
```

---

## 🧠 Implementation Details

### WebRTC Peer Connection (`useWebRTCConnection.ts`)
- Creates `RTCPeerConnection` with STUN/TURN servers from `rtcConfig.ts`
- ICE candidate queuing: candidates arriving before remote description is set are stored and processed after `setRemoteDescription`
- Track replacement for screen sharing: `sender.replaceTrack()`
- Debug logging with emoji-prefixed console messages
- Connection state monitoring via `onconnectionstatechange`

### STUN/TURN Configuration (`rtcConfig.ts`)
```
ICE Servers:
  ├── Google STUN (stun.l.google.com:19302)
  ├── Google STUN (stun1.l.google.com:19302)
  ├── Metered TURN (relay.metered.ca:80/443/TCP)
  ├── OpenRelay TURN (openrelay.metered.ca:80/443)
  └── Viagenie TURN (numb.viagenie.ca:3478)
iceCandidatePoolSize: 10
iceTransportPolicy: "all"
bundlePolicy: "max-bundle"
rtcpMuxPolicy: "require"
```

### AI Background Replacement (`useBackgroundProcessing.ts`)
1. Original video track is drawn to a hidden `<canvas>` via `requestAnimationFrame`
2. MediaPipe `SelfieSegmentation` runs segmentation on each frame
3. A second `<canvas>` composites: person (original pixels) + background (blur or image)
4. Processed canvas is captured as `MediaStream` via `canvas.captureStream(30)`
5. The new video track replaces the original in the peer connection
6. Original camera is stopped in background to save resources
7. On disable, original track is restored

### Mediasoup SFU (backend2)
- **Worker:** Single `mediaSoup.createWorker()` per room
- **Router:** Created from worker with `mediaCodecs` (opus audio, H264 video)
- **Transport Types:** Separate send/receive transports for camera and screen sharing
- **Producer:** Created per track (audio, video, screen) per peer
- **Consumer:** Created per producer per consuming peer
- **Producer List:** Tracks all active producer IDs for late-joiner broadcast
- **Cleanup:** On disconnect — closes send transport, all recv transports, all producers, all consumers; removes peer from map

### Connection Quality Monitoring (`useConnectionMonitoring.ts`)
- Polls `RTCPeerConnection.getStats()` every 3 seconds
- Collects: `bytesReceived` (audio + video), packets lost
- Classification:
  - **Excellent:** No packet loss for <3 seconds
  - **Good:** No packet loss for <8 seconds
  - **Poor:** No packet loss for <15 seconds
  - **Disconnected:** 15+ seconds with no data received
- Detects TURN relay usage from `selected candidate pair`
- Auto-restarts ICE on connection failure with 2-second delay

### Resolution & Bitrate Control (`useMediaStream.ts`)

| Preset | Resolution | Bitrate |
|--------|-----------|---------|
| 360p | 640×360 | 250 Kbps |
| 480p | 854×480 | 500 Kbps |
| 720p | 1280×720 | 1 Mbps |
| 1080p | 1920×1080 | 2.5 Mbps |
| 1440p | 2560×1440 | 5 Mbps |
| 2160p | 3840×2160 | 12 Mbps |

- Switches camera constraints dynamically
- Updates `RTCRtpSender.setParameters()` for bitrate control

---

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Latency** | <50ms | P2P direct connection |
| **Max P2P Participants** | 2 | By design |
| **Max SFU Participants** | 100+ | Depends on server resources |
| **Build Time** | ~5s | Vite optimization |
| **Bundle Size** | ~150KB | Minified + gzipped |

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Follow ESLint rules
- Add comments for complex logic
- Test on both desktop and mobile

---

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Check browser permissions
- Ensure you're using HTTPS on production
- Verify devices are not in use by other apps

### Connection Issues
- Check backend server is running
- Verify CORS settings
- Check firewall and network settings
- Review browser console for errors

### Group Video Not Working
- Ensure `backend2` is running on the correct port
- Check MediaSoup system requirements
- Verify environment variables

---

## 📜 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 📞 Support & Contact

- 📧 Email: [hgouda244@gmail.com]
- 🐛 Issues: [GitHub Issues](https://github.com/Swayamhp/Webrtc_video_call/issues)
- 🌐 Live Demo: https://videoconnecthp.netlify.app
- 💬 Discussions: [GitHub Discussions](https://github.com/Swayamhp/Webrtc_video_call/discussions)

---

## 🙏 Acknowledgments

- [WebRTC](https://webrtc.org/) - Real-time communication
- [MediaSoup](https://mediasoup.org/) - SFU implementation
- [Socket.IO](https://socket.io/) - Real-time signaling
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

<div align="center">

**Built with ❤️ by [Swayamhp](https://github.com/Swayamhp)**

⭐ If you find this project helpful, please give it a star!

</div>
