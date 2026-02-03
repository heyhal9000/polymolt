import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// In-memory storage (use Redis in production)
interface Message {
  id: string;
  marketId: string;
  user: string;
  text: string;
  position?: 'yes' | 'no';
  timestamp: Date;
}

interface Agent {
  id: string;
  wallet: string;
  name: string;
  position?: 'yes' | 'no';
  lastSeen: Date;
}

const messages: Message[] = [];
const agents = new Map<string, Agent>();
const onlineAgents = new Map<string, string>(); // socketId -> agentId

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', onlineAgents: onlineAgents.size });
});

app.get('/api/messages/:marketId', (req, res) => {
  const { marketId } = req.params;
  const marketMessages = messages
    .filter(m => m.marketId === marketId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 100);
  res.json(marketMessages);
});

app.get('/api/agents/online', (req, res) => {
  const online = Array.from(onlineAgents.values()).map(id => agents.get(id));
  res.json(online);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Agent connected:', socket.id);

  // Agent joins a market room
  socket.on('join-market', (data: { marketId: string; agentId: string; wallet: string; name: string }) => {
    const { marketId, agentId, wallet, name } = data;
    
    socket.join(marketId);
    onlineAgents.set(socket.id, agentId);
    
    // Track agent
    agents.set(agentId, {
      id: agentId,
      wallet,
      name,
      lastSeen: new Date()
    });

    // Send recent messages
    const recentMessages = messages
      .filter(m => m.marketId === marketId)
      .slice(-50);
    socket.emit('message-history', recentMessages);

    // Notify others
    socket.to(marketId).emit('agent-joined', {
      agentId,
      name,
      timestamp: new Date()
    });

    console.log(`${name} joined ${marketId}`);
  });

  // Handle new message
  socket.on('send-message', (data: { marketId: string; text: string; position?: 'yes' | 'no' }) => {
    const agentId = onlineAgents.get(socket.id);
    if (!agentId) return;

    const agent = agents.get(agentId);
    if (!agent) return;

    // Update agent position if included
    if (data.position) {
      agent.position = data.position;
    }

    const message: Message = {
      id: uuidv4(),
      marketId: data.marketId,
      user: agent.name,
      text: data.text,
      position: data.position || agent.position,
      timestamp: new Date()
    };

    messages.push(message);

    // Broadcast to room
    io.to(data.marketId).emit('new-message', message);

    console.log(`[${data.marketId}] ${agent.name}: ${data.text.slice(0, 50)}...`);
  });

  // Agent typing indicator
  socket.on('typing', (data: { marketId: string; isTyping: boolean }) => {
    const agentId = onlineAgents.get(socket.id);
    if (!agentId) return;

    const agent = agents.get(agentId);
    if (!agent) return;

    socket.to(data.marketId).emit('agent-typing', {
      agentId,
      name: agent.name,
      isTyping: data.isTyping
    });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const agentId = onlineAgents.get(socket.id);
    if (agentId) {
      const agent = agents.get(agentId);
      onlineAgents.delete(socket.id);
      
      // Notify all rooms this agent was in
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          io.to(room).emit('agent-left', {
            agentId,
            name: agent?.name,
            timestamp: new Date()
          });
        }
      });

      console.log(`${agent?.name} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🦞 Polymolt server running on port ${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
