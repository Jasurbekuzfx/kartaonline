import React, { useState } from 'react';
import {
  ChevronLeft,
  Users,
  PlusCircle,
  Zap,
  Copy,
  Check,
  UserPlus,
  X,
} from 'lucide-react';
import { AvatarIllustration } from './AvatarIllustration';
import { RemotePlayerProfile } from '../utils/socketClient';

export interface OnlineRoom {
  id: string;
  name: string;
  currentPlayers: number;
  maxPlayers: 2 | 3 | 4;
  modeLabel: 'Oddiy o‘yin' | 'Tezkor o‘yin' | 'Juftlik (2x2)';
  isPairMode?: boolean;
}

interface OnlineLobbyViewProps {
  initialTab?: 'xonalar' | 'dostlar';
  inviteCode: string;
  onlinePlayers: RemotePlayerProfile[];
  currentUserId: string;
  onBack: () => void;
  onJoinRoom: (room: OnlineRoom) => void;
  onQuickMatch: () => void;
}

const INITIAL_ROOMS: OnlineRoom[] = [
  { id: '2841', name: 'Toshkent', currentPlayers: 3, maxPlayers: 4, modeLabel: 'Oddiy o‘yin' },
  { id: '3109', name: 'Samarqand', currentPlayers: 2, maxPlayers: 4, modeLabel: 'Oddiy o‘yin' },
  { id: '4512', name: 'Buxoro', currentPlayers: 3, maxPlayers: 4, modeLabel: 'Tezkor o‘yin' },
  { id: '1984', name: 'Andijon', currentPlayers: 1, maxPlayers: 4, modeLabel: 'Oddiy o‘yin' },
  { id: '6203', name: 'Namangan', currentPlayers: 3, maxPlayers: 4, modeLabel: 'Tezkor o‘yin' },
  { id: '7740', name: 'Farg‘ona', currentPlayers: 2, maxPlayers: 4, modeLabel: 'Juftlik (2x2)', isPairMode: true },
];

const DEFAULT_FRIENDS = [
  { id: 'f1', name: 'Aziz', avatar: 'aziz' as const, status: 'Online · Stolda' },
  { id: 'f2', name: 'Malika', avatar: 'malika' as const, status: 'Online · Bo‘sh' },
  { id: 'f3', name: 'Sardor', avatar: 'sardor' as const, status: 'Online · Bo‘sh' },
];

export const OnlineLobbyView: React.FC<OnlineLobbyViewProps> = ({
  initialTab = 'xonalar',
  inviteCode,
  onlinePlayers,
  currentUserId,
  onBack,
  onJoinRoom,
  onQuickMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'xonalar' | 'dostlar'>(initialTab);
  const [rooms, setRooms] = useState<OnlineRoom[]>(INITIAL_ROOMS);
  const [copied, setCopied] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [inviteToast, setInviteToast] = useState<string | null>(null);

  // Create Room Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('Xorazm');
  const [newRoomPlayers, setNewRoomPlayers] = useState<2 | 3 | 4>(4);
  const [newRoomMode, setNewRoomMode] = useState<'Oddiy o‘yin' | 'Tezkor o‘yin' | 'Juftlik (2x2)'>('Oddiy o‘yin');

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteCode).catch(() => {});
    }
    setCopied(true);
    setInviteToast(`Taklif kodi (${inviteCode}) nusxalandi!`);
    setTimeout(() => {
      setCopied(false);
      setInviteToast(null);
    }, 2200);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newRoomName.trim() || 'Toshkent-2';
    const created: OnlineRoom = {
      id: String(Math.floor(1000 + Math.random() * 9000)),
      name: cleanName,
      currentPlayers: 1,
      maxPlayers: newRoomPlayers,
      modeLabel: newRoomMode,
      isPairMode: newRoomMode === 'Juftlik (2x2)' && newRoomPlayers === 4,
    };
    setRooms([created, ...rooms]);
    setShowCreateModal(false);
    onJoinRoom(created);
  };

  const handleJoinByFriendCode = () => {
    const code = friendCodeInput.trim().toUpperCase();
    if (!code) {
      handleCopyCode();
      return;
    }
    const customRoom: OnlineRoom = {
      id: code,
      name: `Do‘st xonasi (${code})`,
      currentPlayers: 2,
      maxPlayers: 4,
      modeLabel: 'Oddiy o‘yin',
    };
    onJoinRoom(customRoom);
  };

  return (
    <div className="relative flex flex-col h-full w-full px-4 pt-3 pb-5 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-200 hover:bg-slate-800/60 active:scale-95 transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-extrabold text-white tracking-wide">
          Online o‘yin
        </h1>
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'xonalar' ? 'dostlar' : 'xonalar')}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-800/60 cursor-pointer"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>

      {/* Segmented Tabs: Xonalar | Do'stlar */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-[#091526] border border-slate-700/60 my-3">
        <button
          type="button"
          onClick={() => setActiveTab('xonalar')}
          className={`h-10 rounded-lg font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'xonalar'
              ? 'btn-gold-glossy shadow'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Xonalar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dostlar')}
          className={`h-10 rounded-lg font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'dostlar'
              ? 'btn-gold-glossy shadow'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Do‘stlar ({onlinePlayers.length})
        </button>
      </div>

      {/* Toast Message */}
      {inviteToast && (
        <div className="mb-2 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-semibold text-center">
          {inviteToast}
        </div>
      )}

      {/* Content Area */}
      {activeTab === 'xonalar' ? (
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="px-3.5 py-2.5 rounded-xl btn-navy-panel flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <h3 className="text-white font-bold text-base leading-snug truncate">
                  {room.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                  <span className="inline-flex items-center gap-1 tabular-nums font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {room.currentPlayers}/{room.maxPlayers}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="inline-flex items-center gap-1 text-slate-300">
                    <span className="text-red-400">♦</span>
                    {room.modeLabel}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onJoinRoom(room)}
                className="px-4 py-1.5 rounded-lg btn-green-glossy text-white font-bold text-xs tracking-wide shrink-0 cursor-pointer"
              >
                Kirish
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {/* Real-time Connected Players with their Uploaded Photos */}
          {onlinePlayers.map((player) => {
            const isMe = player.userId === currentUserId;
            return (
              <div
                key={player.userId}
                className="px-3.5 py-2.5 rounded-xl btn-navy-panel flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AvatarIllustration
                    id="javohir"
                    customPhotoUrl={player.photoUrl}
                    className="w-10 h-10 border border-amber-400/60"
                  />
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">
                      {player.name} {isMe ? '(Siz)' : ''}
                    </h3>
                    <p className="text-xs text-emerald-300 mt-0.5">
                      Online · Faol o‘yinchi
                    </p>
                  </div>
                </div>
                {!isMe && (
                  <button
                    type="button"
                    onClick={() => {
                      setInviteToast(`${player.name} o‘yinga taklif qilindi!`);
                      setTimeout(() => setInviteToast(null), 2200);
                    }}
                    className="px-3 py-1.5 rounded-lg btn-blue-glossy text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Chaqirish</span>
                  </button>
                )}
              </div>
            );
          })}

          {DEFAULT_FRIENDS.map((friend) => (
            <div
              key={friend.id}
              className="px-3.5 py-2.5 rounded-xl btn-navy-panel flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <AvatarIllustration
                  id={friend.avatar}
                  className="w-10 h-10 border border-slate-600"
                />
                <div>
                  <h3 className="text-white font-bold text-sm">{friend.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{friend.status}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInviteToast(`${friend.name} o‘yinga taklif qilindi!`);
                  setTimeout(() => setInviteToast(null), 2200);
                }}
                className="px-3 py-1.5 rounded-lg btn-blue-glossy text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Chaqirish</span>
              </button>
            </div>
          ))}

          {/* Join by Friend's Code Box */}
          <div className="p-3.5 rounded-xl bg-[#091526]/90 border border-slate-700/70 mt-3">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Do‘stingiz yuborgan kod orqali xonaga qo‘shilish:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value)}
                placeholder="Masalan: T4K8Z1"
                maxLength={8}
                className="flex-1 h-10 px-3 rounded-lg bg-[#050D1A] border border-slate-700 text-white font-mono text-sm uppercase focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleJoinByFriendCode}
                className="px-4 h-10 rounded-lg btn-green-glossy text-white font-bold text-xs cursor-pointer"
              >
                Qo‘shilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons: Xona yaratish & Tezkor o'yin */}
      <div className="pt-3 space-y-2.5">
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="w-full h-11.5 rounded-xl btn-gold-glossy font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Xona yaratish</span>
        </button>

        <button
          type="button"
          onClick={onQuickMatch}
          className="w-full h-11.5 rounded-xl btn-blue-glossy text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Tezkor o‘yin</span>
        </button>
      </div>

      {/* Invite Friend Code Footer */}
      <div className="pt-3 mt-2 border-t border-slate-800/80">
        <div className="text-center text-xs text-slate-300 font-medium mb-2">
          Do‘stni taklif qilish
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-10 px-3 rounded-xl bg-[#091526] border border-slate-700/80 flex items-center justify-between">
            <span className="font-mono font-bold text-sm text-slate-100 tracking-wider">
              {inviteCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Kodni nusxalash"
              className="text-slate-400 hover:text-amber-300 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="h-10 px-4 rounded-xl btn-blue-glossy text-white font-bold text-xs tracking-wide shrink-0 cursor-pointer"
          >
            Taklif qilish
          </button>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRoom}
            className="w-full max-w-sm rounded-2xl bg-[#0D1E36] border border-amber-500/40 p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-extrabold text-base">
                Yangi xona yaratish
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Xona nomi</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#071120] border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5">
                O‘yinchilar soni
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([2, 3, 4] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      setNewRoomPlayers(cnt);
                      if (cnt !== 4 && newRoomMode === 'Juftlik (2x2)') {
                        setNewRoomMode('Oddiy o‘yin');
                      }
                    }}
                    className={`h-10 rounded-xl font-bold text-sm cursor-pointer ${
                      newRoomPlayers === cnt
                        ? 'btn-gold-glossy'
                        : 'bg-[#071120] text-slate-300 border border-slate-700'
                    }`}
                  >
                    {cnt} kishi
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5">O‘yin turi</label>
              <div className="grid grid-cols-1 gap-2">
                {(['Oddiy o‘yin', 'Tezkor o‘yin', ...(newRoomPlayers === 4 ? (['Juftlik (2x2)'] as const) : [])] as const).map(
                  (mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setNewRoomMode(mode)}
                      className={`h-9.5 px-3 rounded-xl font-semibold text-xs text-left flex items-center justify-between cursor-pointer ${
                        newRoomMode === mode
                          ? 'bg-amber-500/20 border border-amber-400 text-amber-200'
                          : 'bg-[#071120] border border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{mode}</span>
                      {newRoomMode === mode && <span>✓</span>}
                    </button>
                  )
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl btn-green-glossy text-white font-extrabold text-sm cursor-pointer"
            >
              Xonani ochish va boshlash
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
