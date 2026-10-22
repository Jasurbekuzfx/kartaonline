import React from 'react';
import { ChevronLeft, Play, Users } from 'lucide-react';
import { BotDifficulty } from '../rules/burkozelRules';
import { AvatarIllustration, AvatarId } from './AvatarIllustration';

interface BotSetupViewProps {
  difficulty: BotDifficulty;
  playerCount: 2 | 3 | 4;
  isPairMode: boolean;
  onChangeDifficulty: (d: BotDifficulty) => void;
  onChangePlayerCount: (count: 2 | 3 | 4) => void;
  onChangePairMode: (isPair: boolean) => void;
  onStartGame: () => void;
  onBack: () => void;
}

const BOT_LEVELS: {
  id: BotDifficulty;
  title: string;
  subtitle: string;
  avatar: AvatarId;
}[] = [
  {
    id: 'oson',
    title: 'Oson',
    subtitle: 'Yangi boshlovchilar uchun mos',
    avatar: 'oson_bola',
  },
  {
    id: 'ortacha',
    title: 'O‘rtacha',
    subtitle: 'Muvozanatli daraja',
    avatar: 'ortacha_aka',
  },
  {
    id: 'kuchli',
    title: 'Kuchli',
    subtitle: 'Tajribali o‘yinchilar uchun',
    avatar: 'kuchli_ota',
  },
  {
    id: 'usta',
    title: 'Usta',
    subtitle: 'Haqiqiy sinov',
    avatar: 'usta_bobo',
  },
];

export const BotSetupView: React.FC<BotSetupViewProps> = ({
  difficulty,
  playerCount,
  isPairMode,
  onChangeDifficulty,
  onChangePlayerCount,
  onChangePairMode,
  onStartGame,
  onBack,
}) => {
  return (
    <div className="flex flex-col justify-between h-full w-full px-4 pt-3 pb-5 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-200 hover:bg-slate-800/60 active:scale-95 transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-extrabold text-white tracking-wide">
          Bot bilan o‘ynash
        </h1>
        <div className="w-10" />
      </div>

      {/* 2x2 Difficulty Grid */}
      <div className="grid grid-cols-2 gap-3 my-auto py-2">
        {BOT_LEVELS.map((lvl) => {
          const isSelected = difficulty === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onChangeDifficulty(lvl.id)}
              className={`relative rounded-2xl p-3 flex flex-col items-center text-center transition-all cursor-pointer overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1E3A5F] to-[#0F243C] border-2 border-[#FBBF24] shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                  : 'btn-navy-panel opacity-90 hover:opacity-100'
              }`}
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden mb-2 border border-white/10 shadow-inner">
                <AvatarIllustration id={lvl.avatar} className="w-full h-full" />
              </div>
              <h3 className="text-white font-extrabold text-lg leading-tight">
                {lvl.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-snug line-clamp-2">
                {lvl.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Player Count Selector + Pair Mode Toggle (for 4 players) */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-2xl btn-navy-panel">
          <div className="text-center text-sm font-bold text-slate-200 mb-2.5">
            O‘yinchilar soni
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {([2, 3, 4] as const).map((cnt) => {
              const active = playerCount === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    onChangePlayerCount(cnt);
                    if (cnt !== 4) onChangePairMode(false);
                  }}
                  className={`h-11 rounded-xl font-extrabold text-base transition-all cursor-pointer tabular-nums ${
                    active
                      ? 'btn-gold-glossy shadow-md'
                      : 'bg-[#091426] border border-slate-700/80 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {cnt}
                </button>
              );
            })}
          </div>

          {/* 4-Player Team/Pair Mode Option */}
          {playerCount === 4 && (
            <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Rejim: Juftlik bo‘lib o‘ynash (2x2)</span>
              </div>
              <button
                type="button"
                onClick={() => onChangePairMode(!isPairMode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isPairMode
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 border border-slate-600'
                }`}
              >
                {isPairMode ? 'Yoqilgan (2x2)' : 'Har kim o‘zi uchun'}
              </button>
            </div>
          )}
        </div>

        {/* Start Game CTA */}
        <button
          type="button"
          onClick={onStartGame}
          className="w-full h-14 rounded-2xl btn-green-glossy flex items-center justify-center gap-2.5 text-white font-extrabold text-lg tracking-wide cursor-pointer"
        >
          <Play className="w-6 h-6 fill-amber-300 text-amber-300" />
          <span>O‘yinni boshlash</span>
        </button>
      </div>
    </div>
  );
};
