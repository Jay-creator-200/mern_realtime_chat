import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json());

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

// MongoDB connect
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_chat';
mongoose.connect(MONGODB_URI).then(()=> console.log('MongoDB connected')).catch(err => console.error('Mongo error', err));

// Message model
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true, trim: true, maxlength: 40 },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  room: { type: String, default: 'general', index: true }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// REST endpoints
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get('/api/messages', async (req, res) => {
  const room = req.query.room || 'general';
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const messages = await Message.find({ room }).sort({ createdAt: -1 }).limit(limit).lean();
  res.json(messages.reverse());
});

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  socket.on('chat:join', (room = 'general') => {
    socket.join(room);
    socket.emit('chat:system', `Joined room: ${room}`);
  });

  socket.on('chat:message', async (payload) => {
    try {
      const { sender, text, room = 'general' } = payload || {};
      if (!sender || !text) return;
      const msg = await Message.create({ sender, text, room });
      io.to(room).emit('chat:message', {
        _id: msg._id,
        sender: msg.sender,
        text: msg.text,
        room: msg.room,
        createdAt: msg.createdAt
      });
    } catch (err) {
      console.error('chat:message error', err);
      socket.emit('chat:error', 'Message failed.');
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected', socket.id, reason);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`API & WS running on http://localhost:${PORT}`));
