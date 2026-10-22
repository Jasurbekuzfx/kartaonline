import React, { useRef } from 'react';
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  Camera,
  Trash2,
} from 'lucide-react';
import { AvatarIllustration } from './AvatarIllustration';
import { processProfileImageFile } from '../utils/imageUpload';

interface SettingsViewProps {
  playerName: string;
  playerPhotoUrl: string | null;
  soundEnabled: boolean;
  autoSortHand: boolean;
  onChangePlayerName: (name: string) => void;
  onChangePlayerPhoto: (dataUrl: string | null) => void;
  onToggleSound: () => void;
  onToggleAutoSort: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  playerName,
  playerPhotoUrl,
  soundEnabled,
  autoSortHand,
  onChangePlayerName,
  onChangePlayerPhoto,
  onToggleSound,
  onToggleAutoSort,
  onBack,
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
    <div className="flex flex-col justify-between h-full w-full px-4 pt-3 pb-5 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-200 hover:bg-slate-800/60 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-extrabold text-white tracking-wide">
          Sozlamalar
        </h1>
        <div className="w-10" />
      </div>

      {/* Settings Controls */}
      <div className="flex-1 py-4 space-y-3.5 overflow-y-auto">
        {/* Profile Photo Upload Card */}
        <div className="p-4 rounded-2xl btn-navy-panel flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-0.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-600">
              <AvatarIllustration
                id="javohir"
                customPhotoUrl={playerPhotoUrl}
                className="w-14 h-14 border-2 border-[#081528]"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Profil rasmi</div>
              <div className="text-xs text-slate-400">
                Ushbu rasm barcha o‘yinchilarga ko‘rinadi
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl btn-gold-glossy text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Rasm qo‘yish</span>
            </button>
            {playerPhotoUrl && (
              <button
                type="button"
                onClick={() => onChangePlayerPhoto(null)}
                title="Rasmni o‘chirish"
                className="w-8 h-8 rounded-xl bg-red-900/50 border border-red-500/40 flex items-center justify-center text-red-300 hover:bg-red-800/60 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Player Name */}
        <div className="p-4 rounded-2xl btn-navy-panel space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <User className="w-4 h-4" />
            <span>O‘yinchi ismi</span>
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => onChangePlayerName(e.target.value)}
            maxLength={18}
            placeholder="Ismingizni kiriting"
            className="w-full h-11 px-3.5 rounded-xl bg-[#071120] border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Sound Effects Toggle */}
        <div className="p-4 rounded-2xl btn-navy-panel flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-amber-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <div className="text-sm font-bold text-white">Ovoz effektlari</div>
              <div className="text-xs text-slate-400">
                Karta tashlash va yutuq ovozlari
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition ${
              soundEnabled
                ? 'btn-green-glossy text-white'
                : 'bg-slate-800 text-slate-300 border border-slate-600'
            }`}
          >
            {soundEnabled ? 'Yoqilgan' : 'O‘chirilgan'}
          </button>
        </div>

        {/* Auto-sort Hand Toggle */}
        <div className="p-4 rounded-2xl btn-navy-panel flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-sm font-bold text-white">
                Kartalarni tartiblash
              </div>
              <div className="text-xs text-slate-400">
                Kozir va mastlar bo‘yicha avtomatik terish
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleAutoSort}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition ${
              autoSortHand
                ? 'btn-green-glossy text-white'
                : 'bg-slate-800 text-slate-300 border border-slate-600'
            }`}
          >
            {autoSortHand ? 'Yoqilgan' : 'O‘chirilgan'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full h-12 rounded-xl btn-gold-glossy font-extrabold text-sm cursor-pointer"
      >
        Saqlash va qaytish
      </button>
    </div>
  );
};
