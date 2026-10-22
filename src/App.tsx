/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BotDifficulty } from './rules/burkozelRules';
import { MainMenuView } from './components/MainMenuView';
import { OnlineLobbyView, OnlineRoom } from './components/OnlineLobbyView';
import { BotSetupView } from './components/BotSetupView';
import { GameTableView } from './components/GameTableView';
import { RulesView } from './components/RulesView';
import { SettingsView } from './components/SettingsView';
import { soundFX } from './utils/sound';
import {
  multiplayerClient,
  RemotePlayerProfile,
} from './utils/socketClient';
import { Trophy, Sparkles, ShieldCheck, Layers } from 'lucide-react';

export type ScreenMode =
  | 'MENU'
  | 'ONLINE'
  | 'FRIENDS'
  | 'BOT_SETUP'
  | 'GAME_TABLE'
  | 'RULES'
  | 'SETTINGS';

export default function App() {
  const [screen, setScreen] = useState<ScreenMode>('MENU');

  // User Profile & Preferences (Persisted in localStorage & Synced via WebSockets)
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('burkozel_player_name') || 'Javohir';
    } catch {
      return 'Javohir';
    }
  });

  const [playerPhotoUrl, setPlayerPhotoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('burkozel_player_photo') || null;
    } catch {
      return null;
    }
  });

  const [onlinePlayers, setOnlinePlayers] = useState<RemotePlayerProfile[]>([]);
  const [coins, setCoins] = useState<number>(12450);
  const [inviteCode] = useState<string>('T4K8Z1');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoSortHand, setAutoSortHand] = useState<boolean>(true);

  // Match Settings
  const [difficulty, setDifficulty] = useState<BotDifficulty>('oson');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [isPairMode, setIsPairMode] = useState<boolean>(false);
  const [roomTitle, setRoomTitle] = useState<string>('Xona 2841');

  // Connect to Real-Time Socket.IO Server on Mount
  useEffect(() => {
    multiplayerClient.connect(playerName, playerPhotoUrl, (players) => {
      setOnlinePlayers(players);
    });
  }, []);

  const handleUpdatePlayerName = (newName: string) => {
    setPlayerName(newName);
    try {
      localStorage.setItem('burkozel_player_name', newName);
    } catch {}
    multiplayerClient.syncProfile(newName, playerPhotoUrl, roomTitle);
  };

  const handleUpdatePlayerPhoto = (newPhotoUrl: string | null) => {
    setPlayerPhotoUrl(newPhotoUrl);
    try {
      if (newPhotoUrl) {
        localStorage.setItem('burkozel_player_photo', newPhotoUrl);
      } else {
        localStorage.removeItem('burkozel_player_photo');
      }
    } catch {}
    multiplayerClient.syncProfile(playerName, newPhotoUrl, roomTitle);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
  };

  const handleStartQuickBotGame = () => {
    setRoomTitle('Xona 2841');
    multiplayerClient.joinRoom(playerName, playerPhotoUrl, 'Xona 2841');
    setScreen('GAME_TABLE');
  };

  const handleJoinOnlineRoom = (room: OnlineRoom) => {
    const title = `${room.name} #${room.id}`;
    setPlayerCount(room.maxPlayers);
    setIsPairMode(Boolean(room.isPairMode));
    setDifficulty(room.modeLabel === 'Tezkor o‘yin' ? 'kuchli' : 'ortacha');
    setRoomTitle(title);
    multiplayerClient.joinRoom(playerName, playerPhotoUrl, title);
    setScreen('GAME_TABLE');
  };

  const handleQuickOnlineMatch = () => {
    const title = 'Tezkor Xona 2841';
    setPlayerCount(4);
    setIsPairMode(false);
    setDifficulty('ortacha');
    setRoomTitle(title);
    multiplayerClient.joinRoom(playerName, playerPhotoUrl, title);
    setScreen('GAME_TABLE');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#040B16] text-slate-100 flex items-center justify-center lg:p-6 overflow-hidden">
      <div className="w-full max-w-6xl flex items-center justify-center gap-8">
        {/* Main Mobile Miniapp Frame */}
        <main className="w-full sm:w-[412px] h-[100dvh] sm:h-[820px] sm:max-h-[94vh] bg-gradient-to-b from-[#0C1D36] via-[#081528] to-[#050D1A] sm:rounded-[38px] sm:border-2 sm:border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col shrink-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full h-full flex flex-col"
            >
              {screen === 'MENU' && (
                <MainMenuView
                  playerName={playerName}
                  playerPhotoUrl={playerPhotoUrl}
                  coins={coins}
                  onChangePlayerPhoto={handleUpdatePlayerPhoto}
                  onQuickPlay={handleStartQuickBotGame}
                  onOpenOnline={() => setScreen('ONLINE')}
                  onOpenBots={() => setScreen('BOT_SETUP')}
                  onOpenFriends={() => setScreen('FRIENDS')}
                  onOpenRules={() => setScreen('RULES')}
                  onOpenSettings={() => setScreen('SETTINGS')}
                />
              )}

              {(screen === 'ONLINE' || screen === 'FRIENDS') && (
                <OnlineLobbyView
                  initialTab={screen === 'FRIENDS' ? 'dostlar' : 'xonalar'}
                  inviteCode={inviteCode}
                  onlinePlayers={onlinePlayers}
                  currentUserId={multiplayerClient.userId}
                  onBack={() => setScreen('MENU')}
                  onJoinRoom={handleJoinOnlineRoom}
                  onQuickMatch={handleQuickOnlineMatch}
                />
              )}

              {screen === 'BOT_SETUP' && (
                <BotSetupView
                  difficulty={difficulty}
                  playerCount={playerCount}
                  isPairMode={isPairMode}
                  onChangeDifficulty={setDifficulty}
                  onChangePlayerCount={setPlayerCount}
                  onChangePairMode={setIsPairMode}
                  onStartGame={() => {
                    const levelNames: Record<BotDifficulty, string> = {
                      oson: 'Oson Bot',
                      ortacha: 'O‘rtacha Bot',
                      kuchli: 'Kuchli Bot',
                      usta: 'Usta Bot',
                    };
                    const title = `${levelNames[difficulty]} · ${playerCount} kishi${
                      isPairMode && playerCount === 4 ? ' (2x2)' : ''
                    }`;
                    setRoomTitle(title);
                    multiplayerClient.joinRoom(
                      playerName,
                      playerPhotoUrl,
                      title
                    );
                    setScreen('GAME_TABLE');
                  }}
                  onBack={() => setScreen('MENU')}
                />
              )}

              {screen === 'GAME_TABLE' && (
                <GameTableView
                  roomTitle={roomTitle}
                  playerName={playerName}
                  playerPhotoUrl={playerPhotoUrl}
                  onlinePlayers={onlinePlayers}
                  currentUserId={multiplayerClient.userId}
                  playerCount={playerCount}
                  isPairMode={isPairMode}
                  difficulty={difficulty}
                  autoSortHand={autoSortHand}
                  onChangePlayerPhoto={handleUpdatePlayerPhoto}
                  onExitToMenu={() => setScreen('MENU')}
                  onRewardCoins={(amt) => setCoins((c) => c + amt)}
                />
              )}

              {screen === 'RULES' && (
                <RulesView onBack={() => setScreen('MENU')} />
              )}

              {screen === 'SETTINGS' && (
                <SettingsView
                  playerName={playerName}
                  playerPhotoUrl={playerPhotoUrl}
                  soundEnabled={soundEnabled}
                  autoSortHand={autoSortHand}
                  onChangePlayerName={handleUpdatePlayerName}
                  onChangePlayerPhoto={handleUpdatePlayerPhoto}
                  onToggleSound={handleToggleSound}
                  onToggleAutoSort={() => setAutoSortHand((v) => !v)}
                  onBack={() => setScreen('MENU')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Desktop Companion Reference Panel */}
        <aside className="hidden lg:flex flex-col justify-between w-[420px] h-[820px] max-h-[93vh] rounded-[34px] bg-[#091526]/90 border border-slate-800/90 p-6 shadow-2xl space-y-5">
          <div>
            <div className="font-display text-2xl font-black tracking-wider gold-title">
              BURKOZEL MINIAPP
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              O‘zbek tilidagi klassik 32 talik karta o‘yini (7, 8, 9, 10, Valet,
              Dama, Qirol, Tuz). Har bir o‘yinchi o‘z shaxsiy rasmini yuklashi
              mumkin va u real vaqtda barcha ishtirokchilarga ko‘rinadi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#06101E] border border-slate-800 space-y-2.5">
            <div className="text-xs font-extrabold text-amber-300">
              Bo‘limlarga tezkor o‘tish:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScreen('MENU')}
                className={`h-9 px-3 rounded-xl text-xs font-bold cursor-pointer transition ${
                  screen === 'MENU'
                    ? 'btn-gold-glossy'
                    : 'btn-navy-panel text-slate-200'
                }`}
              >
                1. Bosh menyu
              </button>
              <button
                type="button"
                onClick={() => setScreen('ONLINE')}
                className={`h-9 px-3 rounded-xl text-xs font-bold cursor-pointer transition ${
                  screen === 'ONLINE'
                    ? 'btn-gold-glossy'
                    : 'btn-navy-panel text-slate-200'
                }`}
              >
                2. Online o‘yin
              </button>
              <button
                type="button"
                onClick={() => setScreen('BOT_SETUP')}
                className={`h-9 px-3 rounded-xl text-xs font-bold cursor-pointer transition ${
                  screen === 'BOT_SETUP'
                    ? 'btn-gold-glossy'
                    : 'btn-navy-panel text-slate-200'
                }`}
              >
                3. Bot bilan o‘ynash
              </button>
              <button
                type="button"
                onClick={() => setScreen('GAME_TABLE')}
                className={`h-9 px-3 rounded-xl text-xs font-bold cursor-pointer transition ${
                  screen === 'GAME_TABLE'
                    ? 'btn-gold-glossy'
                    : 'btn-navy-panel text-slate-200'
                }`}
              >
                4. O‘yin stoli
              </button>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            <div className="p-3.5 rounded-2xl btn-navy-panel space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Layers className="w-4 h-4" />
                <span>Karta ochkolari (Jami 120 ochko)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-xs tabular-nums">
                <div className="p-2 rounded-lg bg-[#050D1A] text-center">
                  <span className="font-extrabold text-white">Tuz:</span>{' '}
                  <span className="text-amber-400 font-bold">11</span>
                </div>
                <div className="p-2 rounded-lg bg-[#050D1A] text-center">
                  <span className="font-extrabold text-white">10:</span>{' '}
                  <span className="text-amber-400 font-bold">10</span>
                </div>
                <div className="p-2 rounded-lg bg-[#050D1A] text-center">
                  <span className="font-extrabold text-white">Qirol:</span>{' '}
                  <span className="text-amber-400 font-bold">4</span>
                </div>
                <div className="p-2 rounded-lg bg-[#050D1A] text-center">
                  <span className="font-extrabold text-white">Dama:</span>{' '}
                  <span className="text-amber-400 font-bold">3</span>
                </div>
                <div className="p-2 rounded-lg bg-[#050D1A] text-center">
                  <span className="font-extrabold text-white">Valet:</span>{' '}
                  <span className="text-amber-400 font-bold">2</span>
                </div>
                <div className="p-2 rounded-lg bg-[#050D1A] text-center">
                  <span className="font-extrabold text-white">9–6:</span>{' '}
                  <span className="text-slate-400 font-bold">0</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl btn-navy-panel space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Maxsus kombinatsiyalar</span>
              </div>
              <p className="text-slate-300">
                • <strong className="text-white">Bura:</strong> 4 ta kozir karta
              </p>
              <p className="text-slate-300">
                • <strong className="text-white">Molodka:</strong> Bir xil mastdagi 4 ta karta
              </p>
              <p className="text-slate-300">
                • <strong className="text-white">Moskva:</strong> 3 ta Tuz (biri kozir)
              </p>
              <p className="text-slate-300">
                • <strong className="text-white">To‘rtta oxir:</strong> 4 ta 10 yoki 4 ta Tuz
              </p>
            </div>

            <div className="p-3.5 rounded-2xl btn-navy-panel space-y-1.5 text-xs tabular-nums">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Trophy className="w-4 h-4" />
                <span>Jarima ochkolari (12 gacha)</span>
              </div>
              <p className="text-slate-300">• 61+ ochko — 0 jarima</p>
              <p className="text-slate-300">• 31–60 ochko — 2 jarima</p>
              <p className="text-slate-300">
                • 0–30 ochko (kamida 1 yurish yutsa) — 4 jarima
              </p>
              <p className="text-slate-300">
                • Yurish yutmasa — 6 jarima
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Online sinxronizatsiya faol
            </span>
            <span>Faol: {onlinePlayers.length} o‘yinchi</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
