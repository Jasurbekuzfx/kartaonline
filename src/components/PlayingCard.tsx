import React from 'react';
import { motion } from 'motion/react';
import { Card, SUIT_INFO } from '../rules/burkozelRules';

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  isTrump?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  layoutId?: string;
  onClick?: () => void;
  className?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  selected = false,
  disabled = false,
  isTrump = false,
  size = 'md',
  layoutId,
  onClick,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-8 h-11 rounded-md text-xs',
    sm: 'w-[54px] h-[76px] rounded-xl text-sm',
    md: 'w-[60px] h-[84px] rounded-xl text-sm',
    lg: 'w-[68px] h-[96px] sm:w-[72px] sm:h-[102px] rounded-xl text-base',
  }[size];

  if (faceDown || !card) {
    return (
      <motion.div
        layoutId={layoutId}
        className={`${sizeClasses} relative select-none bg-[#3B6998] border-2 border-white shadow-md overflow-hidden flex items-center justify-center ${className}`}
      >
        <div
          className="w-[88%] h-[90%] rounded border border-white/60 bg-[#4A78A8]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.35) 1px, #4A78A8 1px)',
            backgroundSize: '6px 6px',
            backgroundPosition: '0 0, 3px 3px',
          }}
        />
      </motion.div>
    );
  }

  const suitInfo = SUIT_INFO[card.suit];
  const colorClass = suitInfo.isRed ? 'text-[#E11D48]' : 'text-[#111827]';

  return (
    <motion.button
      layoutId={layoutId}
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      animate={{
        y: selected ? -12 : 0,
        scale: selected ? 1.05 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 26,
      }}
      className={`${sizeClasses} relative select-none bg-white border ${
        selected
          ? 'border-2 border-[#0F5338] ring-3 ring-[#10B981]/45 z-30 shadow-xl'
          : 'border-stone-200 shadow-[0_4px_10px_rgba(0,0,0,0.22)]'
      } flex flex-col justify-between p-1.5 ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      } ${className}`}
    >
      {/* Top-Left Rank & Suit */}
      <div
        className={`flex flex-col items-center leading-none ${colorClass} self-start`}
      >
        <span className="font-extrabold tracking-tighter text-[1.05em]">
          {card.rank}
        </span>
        <span className="text-[0.88em] -mt-0.5">{suitInfo.symbol}</span>
      </div>

      {/* Center Large Suit Symbol */}
      <div
        className={`self-center my-auto flex items-center justify-center ${colorClass}`}
      >
        <span
          className={
            size === 'lg'
              ? 'text-3xl'
              : size === 'md'
              ? 'text-2xl'
              : 'text-2xl'
          }
        >
          {suitInfo.symbol}
        </span>
      </div>

      {/* Bottom-Right Rank */}
      <div
        className={`flex flex-col items-center leading-none ${colorClass} self-end`}
      >
        <span className="font-extrabold tracking-tighter text-[0.95em]">
          {card.rank}
        </span>
      </div>

      {/* Subtle Trump Star Indicator */}
      {isTrump && !disabled && (
        <span
          title="Kozir"
          className="absolute top-1 right-1 text-[9px] font-black text-amber-600"
        >
          ★
        </span>
      )}
    </motion.button>
  );
};
