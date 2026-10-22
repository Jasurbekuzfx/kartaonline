import React, { useRef } from 'react';
import {
  Settings,
  Globe,
  Bot,
  Users,
  BookOpen,
  ChevronRight,
  Play,
  Camera,
} from 'lucide-react';
import { AvatarIllustration } from './AvatarIllustration';
import { processProfileImageFile } from '../utils/imageUpload';

interface MainMenuViewProps {
  playerName: string;
  playerPhotoUrl: string | null;
  coins: number;
  onChangePlayerPhoto: (dataUrl: string | null) => void;
  onQuickPlay: () => void;
  onOpenOnline: () => void;
  onOpenBots: () => void;
  onOpenFriends: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
}

export const MainMenuView: React.FC<MainMenuViewProps> = ({
  playerName,
  playerPhotoUrl,
  coins,
  onChangePlayerPhoto,
  onQuickPlay,
  onOpenOnline,
  onOpenBots,
  onOpenFriends,
  onOpenRules,
  onOpenSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processProfileImageFile(file);
      onChangePlayerPhoto(dataUrl);
    } catch {}
    e.target.value = '';
  };

  return (
    <div className="relative flex flex-col justify-between h-full w-full px-5 pt-4 pb-6 overflow-hidden select-none">
      {/* Hidden File Input for Direct Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Subtle Oriental Arabesque Pattern & Registan Evening Silhouette Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-35"
          style={{
            background: 'radial-gradient(circle, #1E40AF 0%, transparent 70%)',
          }}
        />
        <svg
          viewBox="0 0 400 130"
          className="absolute bottom-0 left-0 right-0 w-full h-32 object-cover opacity-35"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="skyGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#050D1A" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="400" height="130" fill="url(#skyGlow)" />
          <path
            d="M0,130 L0,95 L18,95 L22,40 L28,32 L34,40 L38,95 L65,95 C65,70 95,62 110,85 L125,85 L125,55 L165,55 L165,90 L180,90 C185,55 225,55 230,90 L245,90 L245,52 L285,52 L285,88 L300,88 C312,62 342,68 345,95 L362,95 L366,38 L372,30 L378,38 L382,95 L400,95 L400,130 Z"
            fill="#081528"
          />
          <path d="M0,130 L0,108 L400,108 L400,130 Z" fill="#040B16" />
        </svg>
      </div>

      {/* Top Header: User Profile with Tap-to-Upload Photo & Settings Button */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Rasmni o‘zgartirish"
            className="relative p-0.5 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-lg cursor-pointer group"
          >
            <AvatarIllustration
              id="jasurbek"
              customPhotoUrl={playerPhotoUrl}
              className="w-13 h-13 border-2 border-[#081528]"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-amber-400 border border-[#081528] flex items-center justify-center text-slate-950 shadow">
              <Camera className="w-3 h-3" />
            </span>
          </button>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight tracking-tight">
              {playerName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 flex items-center justify-center text-[11px] font-black text-amber-950 shadow">
                ★
              </span>
              <span className="text-amber-300 font-bold text-sm tabular-nums">
                {coins.toLocaleString('uz-UZ').replace(/,/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Sozlamalar"
          className="w-11 h-11 rounded-xl btn-navy-panel flex items-center justify-center text-amber-400 hover:text-amber-300 active:scale-95 transition-all cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Centerpiece: 4 Aces/Kings Fan & Gold 3D BURKOZEL Crest */}
      <div className="relative z-10 flex flex-col items-center my-auto py-2">
        <div className="relative flex items-center justify-center h-24 w-56 mb-1">
          <div className="w-13 h-19 bg-white rounded-lg border border-slate-300 shadow-md flex flex-col justify-between p-1 -rotate-22 -translate-x-9 translate-y-2">
            <div className="text-red-600 font-extrabold text-xs leading-none">
              A<br />♥
            </div>
            <div className="text-red-600 text-lg self-center">♥</div>
          </div>
          <div className="w-13 h-19 bg-white rounded-lg border border-slate-300 shadow-md flex flex-col justify-between p-1 -rotate-8 -translate-x-3">
            <div className="text-slate-900 font-extrabold text-xs leading-none">
              K<br />♠
            </div>
            <div className="text-slate-900 text-lg self-center">♠</div>
          </div>
          <div className="w-13 h-19 bg-white rounded-lg border border-slate-300 shadow-md flex flex-col justify-between p-1 rotate-8 translate-x-3">
            <div className="text-red-600 font-extrabold text-xs leading-none">
              J<br />♦
            </div>
            <div className="text-red-600 text-lg self-center">♦</div>
          </div>
          <div className="w-13 h-19 bg-white rounded-lg border border-slate-300 shadow-md flex flex-col justify-between p-1 rotate-22 translate-x-9 translate-y-2">
            <div className="text-slate-900 font-extrabold text-xs leading-none">
              J<br />♣
            </div>
            <div className="text-slate-900 text-lg self-center">♣</div>
          </div>
        </div>

        <div className="relative px-6 py-1.5 rounded-2xl bg-gradient-to-b from-[#172554]/90 to-[#0A1128]/95 border-2 border-amber-500/80 shadow-xl">
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-wider gold-title">
            BURKOZEL
          </h1>
        </div>
        <svg viewBox="0 0 180 22" className="w-36 h-5 mt-1 text-amber-400">
          <path
            d="M20,11 Q55,2 90,11 Q125,2 160,11 M60,11 Q90,20 120,11"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="90" cy="11" r="3" fill="currentColor" />
        </svg>
      </div>

      {/* Main Action & Navigation Buttons */}
      <div className="relative z-10 flex flex-col gap-3">
        <button
          type="button"
          onClick={onQuickPlay}
          className="w-full h-15 rounded-2xl btn-green-glossy flex items-center justify-center gap-3 text-white font-extrabold text-2xl tracking-wide cursor-pointer transition-all"
        >
          <Play className="w-7 h-7 fill-amber-300 text-amber-300 drop-shadow" />
          <span>O‘ynash</span>
        </button>

        <button
          type="button"
          onClick={onOpenOnline}
          className="w-full h-13.5 px-4 rounded-xl btn-navy-panel flex items-center justify-between text-white font-bold text-base cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Globe className="w-5 h-5" />
            </div>
            <span>Online o‘yin</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={onOpenBots}
          className="w-full h-13.5 px-4 rounded-xl btn-navy-panel flex items-center justify-between text-white font-bold text-base cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Bot className="w-5 h-5" />
            </div>
            <span>Bot bilan o‘ynash</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={onOpenFriends}
          className="w-full h-13.5 px-4 rounded-xl btn-navy-panel flex items-center justify-between text-white font-bold text-base cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Users className="w-5 h-5" />
            </div>
            <span>Do‘stlar bilan</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onOpenRules}
            className="h-12 px-3 rounded-xl btn-navy-panel flex items-center justify-center gap-2.5 text-slate-100 font-semibold text-sm cursor-pointer transition-all"
          >
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">Qoidalar</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="h-12 px-3 rounded-xl btn-navy-panel flex items-center justify-center gap-2.5 text-slate-100 font-semibold text-sm cursor-pointer transition-all"
          >
            <Settings className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">Sozlamalar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
