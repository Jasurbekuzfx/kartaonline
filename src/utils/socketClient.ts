import { io, Socket } from 'socket.io-client';

export interface RemotePlayerProfile {
  socketId: string;
  userId: string;
  name: string;
  photoUrl: string | null;
  roomId: string | null;
  updatedAt: number;
}

export interface RealtimeChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender: string;
  senderPhotoUrl: string | null;
  text: string;
  time: string;
}

class MultiplayerClient {
  public socket: Socket | null = null;
  public userId: string;

  constructor() {
    let savedId = '';
    try {
      savedId = localStorage.getItem('burkozel_user_id') || '';
      if (!savedId) {
        savedId = 'usr_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('burkozel_user_id', savedId);
      }
    } catch {
      savedId = 'usr_' + Math.random().toString(36).substring(2, 10);
    }
    this.userId = savedId;
  }

  public connect(
    initialName: string,
    initialPhotoUrl: string | null,
    onPlayersSync: (players: RemotePlayerProfile[]) => void,
    onChatMessage?: (msg: RealtimeChatMessage) => void
  ) {
    if (!this.socket) {
      this.socket = io({
        transports: ['websocket', 'polling'],
      });
    }

    this.socket.off('players:sync');
    this.socket.on('players:sync', (players: RemotePlayerProfile[]) => {
      onPlayersSync(players);
    });

    if (onChatMessage) {
      this.socket.off('chat:message');
      this.socket.on('chat:message', (msg: RealtimeChatMessage) => {
        onChatMessage(msg);
      });
    }

    this.socket.on('connect', () => {
      this.syncProfile(initialName, initialPhotoUrl);
    });

    if (this.socket.connected) {
      this.syncProfile(initialName, initialPhotoUrl);
    }
  }

  public syncProfile(
    name: string,
    photoUrl: string | null,
    roomId?: string | null
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('profile:update', {
        userId: this.userId,
        name,
        photoUrl,
        roomId,
      });
    }
    // Also persist via REST API as fallback
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.userId,
        name,
        photoUrl,
        roomId,
      }),
    }).catch(() => {});
  }

  public joinRoom(name: string, photoUrl: string | null, roomId: string) {
    if (this.socket) {
      this.socket.emit('room:join', {
        userId: this.userId,
        name,
        photoUrl,
        roomId,
      });
    }
  }

  public sendChatMessage(
    roomId: string,
    sender: string,
    senderPhotoUrl: string | null,
    text: string
  ) {
    const msg: RealtimeChatMessage = {
      id: `${this.userId}_${Date.now()}`,
      roomId,
      senderId: this.userId,
      sender,
      senderPhotoUrl,
      text,
      time: 'Hozir',
    };
    if (this.socket && this.socket.connected) {
      this.socket.emit('chat:message', msg);
    }
    return msg;
  }
}

export const multiplayerClient = new MultiplayerClient();
