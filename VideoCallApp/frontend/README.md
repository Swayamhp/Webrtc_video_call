# VideoConnect — Frontend

React 19 + TypeScript + Vite UI for the VideoConnect video conferencing app.

> **Full project documentation, architecture diagrams, and backend setup are in the [root README](../../README.md).**

## Quick Start

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:5173`.

## Key Directories

| Directory | Contents |
|-----------|----------|
| `src/components/` | 11 React components (Header, Hero, Footer, VideoGrid, VideoControls, CallHeader, CallFooter, CallStatus, VideoSettingModal, GenerateIdModal, VideoConnectLogo) |
| `src/hooks/` | 6 custom hooks (useWebRTCConnection, useSocketSignaling, useMediaStream, useBackgroundProcessing, useConnectionMonitoring, usePictureInPicture) |
| `src/pages/` | 4 pages (LandingPage, VideoCallPage, DemoGroup, GroupVideoCall) |
| `src/config/` | `rtcConfig.ts` — STUN/TURN server configuration |
| `src/assets/` | Images and audio files |

## Routes

| Path | Component | Type |
|------|-----------|------|
| `/*` | LandingPage | Landing page |
| `/video-call/:roomId` | VideoCallPage | 1:1 P2P call |
| `/group-video-call/:roomId` | DemoGroup | Group call (Mediasoup SFU) |

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview production build
```
