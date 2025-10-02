import { io } from 'socket.io-client';

class VideoCallApp {
  constructor() {
    // Connect to your deployed backend URL
    this.socket = io('http://localhost:3001'); // Change to your deployed URL
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnections = {};
    this.roomId = null;
    this.userId = this.generateUserId();
    
    this.initializeApp();
  }

  generateUserId() {
    return 'user-' + Math.random().toString(36).substr(2, 9);
  }

  initializeApp() {
    this.setupSocketListeners();
    this.setupUIHandlers();
  }

  setupSocketListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.updateConnectionStatus('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.updateConnectionStatus('disconnected');
    });

    // WebRTC signaling events
    this.socket.on('user-connected', (userId) => {
      console.log('User connected:', userId);
      this.createPeerConnection(userId);
      this.createOffer(userId);
    });

    this.socket.on('user-disconnected', (userId) => {
      console.log('User disconnected:', userId);
      this.removePeerConnection(userId);
    });

    this.socket.on('offer', async (data) => {
      await this.handleOffer(data.offer, data.from);
    });

    this.socket.on('answer', async (data) => {
      await this.handleAnswer(data.answer, data.from);
    });

    this.socket.on('ice-candidate', async (data) => {
      await this.handleIceCandidate(data.candidate, data.from);
    });

    // Room management
    this.socket.on('room-users', (users) => {
      console.log('Users in room:', users);
      this.updateUsersList(users);
    });
  }

  setupUIHandlers() {
    // Join room button
    document.getElementById('joinBtn').addEventListener('click', () => {
      this.roomId = document.getElementById('roomInput').value;
      if (this.roomId) {
        this.joinRoom(this.roomId);
      }
    });

    // Start call button
    document.getElementById('startCallBtn').addEventListener('click', () => {
      this.startCall();
    });

    // Hang up button
    document.getElementById('hangupBtn').addEventListener('click', () => {
      this.hangUp();
    });
  }

  async joinRoom(roomId) {
    try {
      // Check if room exists
      this.socket.emit('check-room', roomId, (exists) => {
        if (exists) {
          console.log('Joining existing room:', roomId);
        } else {
          console.log('Creating new room:', roomId);
        }
        
        this.socket.emit('join-room', roomId, this.userId);
        this.updateUI('joined');
      });
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }

  async startCall() {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Display local video
      const localVideo = document.getElementById('localVideo');
      localVideo.srcObject = this.localStream;
      
      this.updateUI('in-call');
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Cannot access camera/microphone. Please check permissions.');
    }
  }

  // WebRTC Configuration (STUN servers)
  getRTCConfiguration() {
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    };
  }

  createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection(this.getRTCConfiguration());
    
    // Add local stream to connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteVideo = document.getElementById('remoteVideo');
      if (event.streams && event.streams[0]) {
        remoteVideo.srcObject = event.streams[0];
      }
    };
    
    // ICE candidate handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          roomId: this.roomId,
          candidate: event.candidate,
          to: userId
        });
      }
    };
    
    this.peerConnections[userId] = peerConnection;
    return peerConnection;
  }

  async createOffer(userId) {
    const peerConnection = this.peerConnections[userId];
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      this.socket.emit('offer', {
        roomId: this.roomId,
        offer: offer,
        to: userId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  async handleOffer(offer, fromUserId) {
    const peerConnection = this.createPeerConnection(fromUserId);
    
    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      this.socket.emit('answer', {
        roomId: this.roomId,
        answer: answer,
        to: fromUserId
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(answer, fromUserId) {
    const peerConnection = this.peerConnections[fromUserId];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  }

  async handleIceCandidate(candidate, fromUserId) {
    const peerConnection = this.peerConnections[fromUserId];
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  }

  removePeerConnection(userId) {
    if (this.peerConnections[userId]) {
      this.peerConnections[userId].close();
      delete this.peerConnections[userId];
    }
    
    // Clear remote video
    const remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = null;
  }

  hangUp() {
    // Close all peer connections
    Object.keys(this.peerConnections).forEach(userId => {
      this.removePeerConnection(userId);
    });
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Clear videos
    document.getElementById('localVideo').srcObject = null;
    document.getElementById('remoteVideo').srcObject = null;
    
    // Leave room
    if (this.roomId) {
      this.socket.emit('leave-room', this.roomId);
    }
    
    this.updateUI('idle');
  }

  updateUI(state) {
    // Implement UI state changes based on your frontend
    console.log('UI state:', state);
  }

  updateConnectionStatus(status) {
    // Update connection status in UI
    console.log('Connection status:', status);
  }

  updateUsersList(users) {
    // Update users list in UI
    console.log('Active users:', users);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.videoCallApp = new VideoCallApp();
});