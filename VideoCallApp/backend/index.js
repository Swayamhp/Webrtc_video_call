const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration for production
const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  process.env.CLIENT_URL,
  "https://your-frontend-app.vercel.app", // Add your actual frontend URL
  // Add more origins as needed
].filter(Boolean); // Remove any undefined values

console.log('🌐 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log('🚫 CORS blocked for origin:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Handle preflight requests
app.options('*', cors());

// Enhanced Socket.io setup for production
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  // Add these for better production handling
  maxHttpBufferSize: 1e8,
  transports: ['websocket', 'polling']
});

// Store active rooms (max 2 users per room)
const rooms = new Map();

// Socket connection handling with enhanced logging
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  console.log('📡 Socket transport:', socket.conn.transport.name);

  // Handle transport upgrades
  socket.conn.on("upgrade", (transport) => {
    console.log(`🔄 Socket ${socket.id} upgraded to:`, transport.name);
  });

  // Handle connection errors
  socket.conn.on("error", (error) => {
    console.error(`❌ Socket ${socket.id} connection error:`, error);
  });

  // Join a room (max 2 users)
  socket.on('join-room', (roomId, userId) => {
    console.log(`🚪 User ${userId} (socket: ${socket.id}) attempting to join room ${roomId}`);
    
    // Validate inputs
    if (!roomId || !userId) {
      console.log('❌ Invalid roomId or userId');
      socket.emit('error', { message: 'Invalid room ID or user ID' });
      return;
    }

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),
        userCount: 0,
        userStates: new Map(),
        sockets: new Map() // Track socket IDs for each user
      });
      console.log(`✅ Created new room: ${roomId}`);
    }

    const room = rooms.get(roomId);

    // Check if room is full (max 2 users)
    if (room.userCount >= 2) {
      console.log(`❌ Room ${roomId} is full. Rejecting user ${userId}`);
      socket.emit('room-full');
      return;
    }

    // Check if user already exists in room
    if (room.users.has(userId)) {
      console.log(`🔄 User ${userId} already in room ${roomId}, updating socket`);
      // Update socket mapping for existing user
      room.sockets.set(userId, socket.id);
    } else {
      // Add new user to room
      room.users.add(userId);
      room.userCount++;
      room.sockets.set(userId, socket.id);
      room.userStates.set(userId, 'connected');
    }
    
    // Store user info in socket
    socket.userId = userId;
    socket.roomId = roomId;
    
    // Join socket room
    socket.join(roomId);
    
    console.log(`✅ User ${userId} joined room ${roomId}. Room now has ${room.userCount}/2 users`);
    console.log(`📊 Room ${roomId} users:`, Array.from(room.users));

    // Notify others in the room about new user
    const otherUsers = Array.from(room.users).filter(id => id !== userId);
    if (otherUsers.length > 0) {
      console.log(`📢 Notifying others in room ${roomId} about new user ${userId}`);
      socket.to(roomId).emit('user-connected', userId);
      
      // Also notify the new user about existing users
      console.log(`📢 Notifying new user ${userId} about existing users:`, otherUsers);
      otherUsers.forEach(existingUserId => {
        socket.emit('user-connected', existingUserId);
      });
    }

    // Send room status update
    const roomUsers = Array.from(room.users);
    io.to(roomId).emit('room-users-update', {
      userCount: room.userCount,
      users: roomUsers
    });
  });

  // WebRTC signaling events with better error handling
  socket.on('offer', (data) => {
    if (!data || !data.roomId || !data.offer) {
      console.log('❌ Invalid offer data from:', socket.userId);
      return;
    }
    
    console.log(`📨 OFFER from ${socket.userId} in room ${data.roomId}`);
    console.log(`   Offer type: ${data.offer.type}`);
    console.log(`   SDP length: ${data.offer.sdp ? data.offer.sdp.length : 'N/A'}`);
    
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      from: socket.userId
    });
  });

  socket.on('answer', (data) => {
    if (!data || !data.roomId || !data.answer) {
      console.log('❌ Invalid answer data from:', socket.userId);
      return;
    }
    
    console.log(`📨 ANSWER from ${socket.userId} in room ${data.roomId}`);
    console.log(`   Answer type: ${data.answer.type}`);
    console.log(`   SDP length: ${data.answer.sdp ? data.answer.sdp.length : 'N/A'}`);
    
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      from: socket.userId
    });
  });

  socket.on('ice-candidate', (data) => {
    if (!data || !data.roomId || !data.candidate) {
      console.log('❌ Invalid ICE candidate data from:', socket.userId);
      return;
    }
    
    console.log(`🧊 ICE CANDIDATE from ${socket.userId} in room ${data.roomId}`);
    console.log(`   Candidate: ${data.candidate.candidate ? data.candidate.candidate.substring(0, 50) + '...' : 'N/A'}`);
    
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.userId
    });
  });

  // Handle user disconnect with better cleanup
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
    console.log(`👤 User ID: ${socket.userId}, Room: ${socket.roomId}`);
    
    if (socket.roomId && socket.userId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        // Check if this is the last socket for this user
        const userSocketId = room.sockets.get(socket.userId);
        if (userSocketId === socket.id) {
          // Remove user from room
          room.users.delete(socket.userId);
          room.userCount--;
          room.userStates.delete(socket.userId);
          room.sockets.delete(socket.userId);
          
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
        } else {
          console.log(`🔄 User ${socket.userId} has another active socket, keeping in room`);
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
        room.sockets.delete(socket.userId);
        
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

  // Enhanced error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });

  // Ping/pong for connection health
  socket.on('ping', (data) => {
    socket.emit('pong', {
      timestamp: Date.now(),
      ...data
    });
  });
});

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const roomInfo = {};
  let totalUsers = 0;
  
  rooms.forEach((room, roomId) => {
    totalUsers += room.userCount;
    roomInfo[roomId] = {
      userCount: room.userCount,
      users: Array.from(room.users),
      userStates: Object.fromEntries(room.userStates),
      sockets: Object.fromEntries(room.sockets)
    };
  });

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    activeRooms: rooms.size,
    totalUsers: totalUsers,
    roomInfo: roomInfo,
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'WebRTC Signaling Server is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      rooms: '/rooms'
    }
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
      sockets: Object.fromEntries(room.sockets),
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
  const userCount = Array.from(rooms.values()).reduce((acc, room) => acc + room.userCount, 0);
  rooms.clear();
  res.json({
    message: `Cleared ${roomCount} rooms with ${userCount} users`,
    timestamp: new Date().toISOString()
  });
});

// Enhanced server startup for Render
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Important for Render

server.listen(PORT, HOST, () => {
  console.log(`\n🚀 Signaling server running on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Allowed origins:`, allowedOrigins);
  console.log(`👥 Max users per room: 2`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🔍 Room debug: http://${HOST}:${PORT}/rooms`);
  console.log(`🏠 Home: http://${HOST}:${PORT}/\n`);
});

// Enhanced graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  console.log(`📊 Closing ${rooms.size} active rooms...`);
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  console.log(`📊 Closing ${rooms.size} active rooms...`);
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});