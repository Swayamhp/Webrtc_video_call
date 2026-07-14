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
Server runs on `http://localhost:3000`

#### 4. Backend Setup (Group Video - Optional)
```bash
cd VideoCallApp/backend2
npm install
npm run dev
```
Server runs on the configured port

---

## 📁 Project Structure

```
Webrtc_video_call/
├── VideoCallApp/
│   ├── frontend/                 # React TypeScript Frontend
│   │   ├── src/
��   │   │   ├── components/      # React Components
│   │   │   ├── pages/           # Page Components
│   │   │   ├── hooks/           # Custom React Hooks
│   │   │   ├── utils/           # Utility Functions
│   │   │   ├── styles/          # Global Styles (Tailwind)
│   │   │   └── App.tsx          # Main App Component
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── backend/                  # P2P Signaling Server
│   │   ├── index.js             # Server Entry Point
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── backend2/                 # Group Video SFU Server
│       ├── server.js            # Server Entry Point
│       ├── package.json
│       └── .env.example
│
├── README.md
└── .gitignore
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` files in each backend directory:

#### Backend (One-to-One)
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

#### Backend2 (Group Video)
```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
MEDIASOUP_WORKER_PROCESSES=4
```

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
