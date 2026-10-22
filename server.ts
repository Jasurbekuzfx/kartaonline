import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';

export interface ConnectedPlayerProfile {
  socketId: string;
  userId: string;
  name: string;
  photoUrl: string | null;
  roomId: string | null;
  seatIndex?: number;
  updatedAt: number;
}

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' },
    maxHttpBufferSize: 5 * 1024 * 1024, // 5MB for profile photo data URLs
  });

  // Authoritative Server State for Players & Room Members
  const playersByUserId = new Map<string, ConnectedPlayerProfile>();
  const socketToUserId = new Map<string, string>();

  function getActivePlayersList(): ConnectedPlayerProfile[] {
    return Array.from(playersByUserId.values());
  }

  function getRoomPlayers(roomId: string): ConnectedPlayerProfile[] {
    return Array.from(playersByUserId.values()).filter(
      (p) => p.roomId === roomId
    );
  }

  // REST API endpoints for profile & players sync
  app.get('/api/players', (_req, res) => {
    res.json({ players: getActivePlayersList() });
  });

  app.post('/api/profile', (req, res) => {
    const { userId, name, photoUrl, roomId } = req.body || {};
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const existing = playersByUserId.get(userId);
    const updated: ConnectedPlayerProfile = {
      socketId: existing?.socketId || '',
      userId,
      name: (name || existing?.name || 'O‘yinchi').slice(0, 24),
      photoUrl:
        photoUrl !== undefined ? photoUrl : existing?.photoUrl || null,
      roomId: roomId !== undefined ? roomId : existing?.roomId || null,
      updatedAt: Date.now(),
    };

    playersByUserId.set(userId, updated);
    io.emit('players:sync', getActivePlayersList());
    if (updated.roomId) {
      io.to(updated.roomId).emit(
        'room:players',
        getRoomPlayers(updated.roomId)
      );
    }

    res.json({ profile: updated, players: getActivePlayersList() });
  });

  // WebSocket Real-Time Handlers
  io.on('connection', (socket) => {
    // Send current players immediately upon connection
    socket.emit('players:sync', getActivePlayersList());

    socket.on(
      'profile:update',
      (payload: {
        userId: string;
        name: string;
        photoUrl: string | null;
        roomId?: string | null;
      }) => {
        if (!payload || !payload.userId) return;
        socketToUserId.set(socket.id, payload.userId);

        const existing = playersByUserId.get(payload.userId);
        const targetRoom =
          payload.roomId !== undefined
            ? payload.roomId
            : existing?.roomId || null;

        const updated: ConnectedPlayerProfile = {
          socketId: socket.id,
          userId: payload.userId,
          name: (payload.name || 'O‘yinchi').slice(0, 24),
          photoUrl: payload.photoUrl ?? null,
          roomId: targetRoom,
          updatedAt: Date.now(),
        };

        playersByUserId.set(payload.userId, updated);

        // Broadcast updated profile list to everyone so everyone sees each person's photo
        io.emit('players:sync', getActivePlayersList());
        if (targetRoom) {
          socket.join(targetRoom);
          io.to(targetRoom).emit('room:players', getRoomPlayers(targetRoom));
        }
      }
    );

    socket.on(
      'room:join',
      (payload: {
        userId: string;
        name: string;
        photoUrl: string | null;
        roomId: string;
      }) => {
        if (!payload || !payload.userId || !payload.roomId) return;
        socketToUserId.set(socket.id, payload.userId);

        const prev = playersByUserId.get(payload.userId);
        if (prev?.roomId && prev.roomId !== payload.roomId) {
          socket.leave(prev.roomId);
          io.to(prev.roomId).emit('room:players', getRoomPlayers(prev.roomId));
        }

        const updated: ConnectedPlayerProfile = {
          socketId: socket.id,
          userId: payload.userId,
          name: (payload.name || prev?.name || 'O‘yinchi').slice(0, 24),
          photoUrl:
            payload.photoUrl !== undefined
              ? payload.photoUrl
              : prev?.photoUrl || null,
          roomId: payload.roomId,
          updatedAt: Date.now(),
        };

        playersByUserId.set(payload.userId, updated);
        socket.join(payload.roomId);

        io.emit('players:sync', getActivePlayersList());
        io.to(payload.roomId).emit(
          'room:players',
          getRoomPlayers(payload.roomId)
        );
      }
    );

    socket.on(
      'chat:message',
      (msg: {
        id: string;
        roomId: string;
        senderId: string;
        sender: string;
        senderPhotoUrl: string | null;
        text: string;
        time: string;
      }) => {
        if (!msg || !msg.text) return;
        io.emit('chat:message', msg);
      }
    );

    socket.on('disconnect', () => {
      const userId = socketToUserId.get(socket.id);
      if (userId) {
        socketToUserId.delete(socket.id);
        const existing = playersByUserId.get(userId);
        if (existing && existing.socketId === socket.id) {
          playersByUserId.delete(userId);
          io.emit('players:sync', getActivePlayersList());
          if (existing.roomId) {
            io.to(existing.roomId).emit(
              'room:players',
              getRoomPlayers(existing.roomId)
            );
          }
        }
      }
    });
  });

  // Mount Vite dev middleware or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Burkozel server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
