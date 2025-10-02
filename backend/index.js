const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store active rooms (max 2 users per room)
const rooms = new Map(); // roomId -> { users: Set, userCount: number, userStates: Map }

// Socket connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Join a room (max 2 users)
  socket.on('join-room', (roomId, userId) => {
    console.log(`🚪 User ${userId} attempting to join room ${roomId}`);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),
        userCount: 0,
        userStates: new Map() // Track user connection states
      });
      console.log(`✅ Created new room: ${roomId}`);
    }

    const room = rooms.get(roomId);

    // Check if room is full (max 2 users)
    if (room.userCount >= 4) {
      console.log(`❌ Room ${roomId} is full. Rejecting user ${userId}`);
      socket.emit('room-full');
      return;
    }

    // Add user to room
    room.users.add(userId);
    room.userCount++;
    room.userStates.set(userId, 'connected');
    
    // Store user info in socket
    socket.userId = userId;
    socket.roomId = roomId;
    
    // Join socket room
    socket.join(roomId);
    
    console.log(`✅ User ${userId} joined room ${roomId}. Room now has ${room.userCount}/2 users`);

    // Notify others in the room about new user
    if (room.userCount > 1) {
      console.log(`📢 Notifying others in room ${roomId} about new user ${userId}`);
      socket.to(roomId).emit('user-connected', userId);
    }
    
    // If there's already another user in the room, notify the new user
    if (room.userCount > 1) {
      // Find the other user in the room
      const otherUsers = Array.from(room.users).filter(id => id !== userId);
      if (otherUsers.length > 0) {
        console.log(`📢 Notifying new user ${userId} about existing user ${otherUsers[0]}`);
        socket.emit('user-connected', otherUsers[0]);
      }
    }

    // Send room status update
    const roomUsers = Array.from(room.users);
    io.to(roomId).emit('room-users-update', {
      userCount: room.userCount,
      users: roomUsers
    });
  });

  // WebRTC signaling events - simplified for two users
  socket.on('offer', (data) => {
    console.log(`📨 OFFER from ${socket.userId} in room ${data.roomId}`);
    console.log(`   Offer type: ${data.offer?.type}`);
    
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      from: socket.userId
    });
  });

  socket.on('answer', (data) => {
    console.log(`📨 ANSWER from ${socket.userId} in room ${data.roomId}`);
    console.log(`   Answer type: ${data.answer?.type}`);
    
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      from: socket.userId
    });
  });

  socket.on('ice-candidate', (data) => {
    console.log(`🧊 ICE CANDIDATE from ${socket.userId} in room ${data.roomId}`);
    console.log(`   Candidate: ${data.candidate?.candidate?.substring(0, 50)}...`);
    
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.userId
    });
  });

  // WebRTC negotiation events
  socket.on('webrtc-state', (data) => {
    console.log(`🔍 WebRTC State from ${socket.userId}:`, data.state);
  });

  // Handle user disconnect
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
    
    if (socket.roomId && socket.userId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        // Remove user from room
        room.users.delete(socket.userId);
        room.userCount--;
        room.userStates.delete(socket.userId);
        
        console.log(`🚪 User ${socket.userId} left room ${socket.roomId}. Room now has ${room.userCount}/2 users`);

        // Notify others in the room
        if (room.userCount > 0) {
          console.log(`📢 Notifying room ${socket.roomId} about user ${socket.userId} disconnect`);
          socket.to(socket.roomId).emit('user-disconnected', socket.userId);
        }

        // Send room status update
        const roomUsers = Array.from(room.users);
        io.to(socket.roomId).emit('room-users-update', {
          userCount: room.userCount,
          users: roomUsers
        });
        
        // Clean up empty rooms
        if (room.userCount === 0) {
          rooms.delete(socket.roomId);
          console.log(`🗑️ Room ${socket.roomId} deleted (empty)`);
        }
      }
    }
  });

  // Handle explicit leave room
  socket.on('leave-room', () => {
    console.log(`🚪 User ${socket.userId} explicitly leaving room ${socket.roomId}`);
    
    if (socket.roomId && socket.userId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.users.delete(socket.userId);
        room.userCount--;
        room.userStates.delete(socket.userId);
        
        console.log(`✅ User ${socket.userId} left room ${socket.roomId}. Room now has ${room.userCount}/2 users`);

        // Notify others
        socket.to(socket.roomId).emit('user-disconnected', socket.userId);

        // Send room status update
        const roomUsers = Array.from(room.users);
        io.to(socket.roomId).emit('room-users-update', {
          userCount: room.userCount,
          users: roomUsers
        });

        // Clean up empty rooms
        if (room.userCount === 0) {
          rooms.delete(socket.roomId);
          console.log(`🗑️ Room ${socket.roomId} deleted (empty)`);
        }
      }
    }

    // Clear socket room membership
    if (socket.roomId) {
      socket.leave(socket.roomId);
    }
    delete socket.roomId;
    delete socket.userId;
  });

  // Chat messages (optional - for future features)
  socket.on('send-message', (data) => {
    console.log(`💬 Chat message from ${socket.userId} in room ${data.roomId}`);
    socket.to(data.roomId).emit('receive-message', {
      message: data.message,
      from: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Check if room exists and has space
  socket.on('check-room', (roomId, callback) => {
    const room = rooms.get(roomId);
    console.log(`🔍 Checking room ${roomId}:`, room ? `exists with ${room.userCount}/2 users` : 'does not exist');
    
    if (room) {
      callback({ 
        exists: true, 
        userCount: room.userCount,
        hasSpace: room.userCount < 2,
        users: Array.from(room.users)
      });
    } else {
      callback({ 
        exists: false, 
        userCount: 0,
        hasSpace: true,
        users: []
      });
    }
  });

  // Get room status
  socket.on('get-room-status', (roomId, callback) => {
    const room = rooms.get(roomId);
    if (room) {
      const result = {
        userCount: room.userCount,
        users: Array.from(room.users),
        hasSpace: room.userCount < 2,
        userStates: Object.fromEntries(room.userStates)
      };
      console.log(`🔍 Room ${roomId} status:`, result);
      callback(result);
    } else {
      const result = {
        userCount: 0,
        users: [],
        hasSpace: true,
        userStates: {}
      };
      console.log(`🔍 Room ${roomId} status: does not exist`);
      callback(result);
    }
  });

  // Ping/pong for connection health
  socket.on('ping', (data) => {
    socket.emit('pong', {
      timestamp: Date.now(),
      ...data
    });
  });
});

// Health check endpoint with detailed room info
app.get('/health', (req, res) => {
  const roomInfo = {};
  let totalUsers = 0;
  
  rooms.forEach((room, roomId) => {
    totalUsers += room.userCount;
    roomInfo[roomId] = {
      userCount: room.userCount,
      users: Array.from(room.users),
      userStates: Object.fromEntries(room.userStates)
    };
  });

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    totalUsers: totalUsers,
    roomInfo: roomInfo
  });
});

// Get all active rooms (for debugging)
app.get('/rooms', (req, res) => {
  const roomInfo = {};
  rooms.forEach((room, roomId) => {
    roomInfo[roomId] = {
      userCount: room.userCount,
      users: Array.from(room.users),
      userStates: Object.fromEntries(room.userStates),
      maxCapacity: 2
    };
  });
  
  res.json({
    timestamp: new Date().toISOString(),
    totalRooms: rooms.size,
    rooms: roomInfo
  });
});

// Clear all rooms (for development/testing)
app.delete('/rooms', (req, res) => {
  const roomCount = rooms.size;
  rooms.clear();
  res.json({
    message: `Cleared ${roomCount} rooms`,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Signaling server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`👥 Max users per room: 2`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Room debug: http://localhost:${PORT}/rooms\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});