import React from 'react';

export type AvatarId =
  | 'jasurbek'
  | 'javohir'
  | 'sardor'
  | 'oson_bola'
  | 'ortacha_aka'
  | 'kuchli_ota'
  | 'usta_bobo'
  | 'malika'
  | 'aziz'
  | 'bot_robo';

interface AvatarIllustrationProps {
  id: AvatarId;
  customPhotoUrl?: string | null;
  className?: string;
}

export const AvatarIllustration: React.FC<AvatarIllustrationProps> = ({
  id,
  customPhotoUrl,
  className = 'w-14 h-14',
}) => {
  if (customPhotoUrl) {
    return (
      <img
        src={customPhotoUrl}
        alt="O‘yinchi rasmi"
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  switch (id) {
    case 'aziz':
    case 'javohir':
    case 'jasurbek':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`rounded-full overflow-hidden shrink-0 ${className}`}
        >
          <rect width="100" height="100" fill="#A3C9A8" />
          {/* Teal Shirt */}
          <path d="M18,100 C22,74 78,74 82,100 Z" fill="#0F766E" />
          <path d="M38,77 L50,90 L62,77 Z" fill="#F8FAFC" />
          {/* Neck & Head */}
          <rect x="43" y="61" width="14" height="18" rx="5" fill="#F4A27E" />
          <ellipse cx="50" cy="48" rx="20" ry="23" fill="#F7B28B" />
          {/* Ears */}
          <circle cx="30" cy="49" r="4" fill="#F4A27E" />
          <circle cx="70" cy="49" r="4" fill="#F4A27E" />
          {/* Clean Dark Hair */}
          <path
            d="M29,43 C27,23 44,17 55,19 C69,21 73,30 70,44 C66,33 56,30 45,31 C36,32 32,36 29,43 Z"
            fill="#111827"
          />
          {/* Brows & Eyes */}
          <path
            d="M36,42 Q41,39 46,42"
            stroke="#111827"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M54,42 Q59,39 64,42"
            stroke="#111827"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="41" cy="47" r="2.6" fill="#111827" />
          <circle cx="59" cy="47" r="2.6" fill="#111827" />
          {/* Nose & Smile */}
          <path
            d="M49,49 L48,54 L51,54"
            stroke="#D97757"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M44,60 Q50,64 56,60"
            stroke="#9A3412"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'sardor':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`rounded-full overflow-hidden shrink-0 ${className}`}
        >
          <rect width="100" height="100" fill="#A3C9A8" />
          {/* Blue Shirt */}
          <path d="M18,100 C22,74 78,74 82,100 Z" fill="#0284C7" />
          {/* Neck & Head */}
          <rect x="43" y="61" width="14" height="18" rx="5" fill="#E89973" />
          <ellipse cx="50" cy="48" rx="20" ry="23" fill="#F3A982" />
          {/* Ears */}
          <circle cx="30" cy="49" r="4" fill="#E89973" />
          <circle cx="70" cy="49" r="4" fill="#E89973" />
          {/* Hair */}
          <path
            d="M29,42 C28,22 44,18 55,19 C68,20 73,29 70,42 C66,32 56,29 45,30 C36,31 32,35 29,42 Z"
            fill="#111827"
          />
          {/* Brows & Eyes */}
          <path
            d="M36,42 Q41,39 46,42"
            stroke="#111827"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M54,42 Q59,39 64,42"
            stroke="#111827"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="41" cy="47" r="2.6" fill="#111827" />
          <circle cx="59" cy="47" r="2.6" fill="#111827" />
          {/* Full Beard & Mustache */}
          <path
            d="M31,51 C31,67 40,72 50,72 C60,72 69,67 69,51 C66,59 60,62 50,62 C40,62 34,59 31,51 Z"
            fill="#111827"
          />
          <path
            d="M40,59 Q50,55 60,59"
            stroke="#111827"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M46,61 Q50,64 54,61"
            stroke="#F8FAFC"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'malika':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`rounded-full overflow-hidden shrink-0 ${className}`}
        >
          <rect width="100" height="100" fill="#A3C9A8" />
          {/* Dark Hair Back */}
          <path
            d="M23,44 C20,64 24,80 30,86 L70,86 C76,80 80,64 77,44 Z"
            fill="#111827"
          />
          {/* Pink/Rose Top */}
          <path d="M18,100 C22,75 78,75 82,100 Z" fill="#DB2777" />
          {/* Neck & Head */}
          <rect x="44" y="61" width="12" height="16" rx="5" fill="#F4A27E" />
          <ellipse cx="50" cy="48" rx="19" ry="22" fill="#F7B28B" />
          {/* Hair Bangs */}
          <path
            d="M28,44 C28,23 72,23 72,44 C66,33 56,29 44,32 C36,34 31,38 28,44 Z"
            fill="#111827"
          />
          {/* Eyes & Smile */}
          <path
            d="M36,42 Q41,39 45,42"
            stroke="#111827"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M55,42 Q59,39 64,42"
            stroke="#111827"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="41" cy="47" r="2.5" fill="#111827" />
          <circle cx="59" cy="47" r="2.5" fill="#111827" />
          <path
            d="M44,59 Q50,63 56,59"
            stroke="#BE123C"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'oson_bola':
      return (
        <svg
          viewBox="0 0 120 120"
          className={`overflow-hidden shrink-0 ${className}`}
        >
          <defs>
            <radialGradient id="bg-oson" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1e4631" />
              <stop offset="100%" stopColor="#09191c" />
            </radialGradient>
          </defs>
          <rect width="120" height="120" fill="url(#bg-oson)" />
          <path d="M18,120 C22,88 98,88 102,120 Z" fill="#dcfce7" />
          <path d="M24,120 C28,90 92,90 96,120 Z" fill="#15803d" />
          <path d="M46,90 L60,115 L74,90 Z" fill="#ffffff" />
          <rect x="52" y="75" width="16" height="18" rx="6" fill="#f5cba7" />
          <ellipse cx="60" cy="56" rx="24" ry="26" fill="#fad7a0" />
          <circle cx="35" cy="58" r="5" fill="#f5cba7" />
          <circle cx="85" cy="58" r="5" fill="#f5cba7" />
          <path d="M34,46 C34,26 86,26 86,46 Z" fill="#16a34a" />
          <path
            d="M32,44 Q60,36 88,44 L92,48 Q60,41 32,48 Z"
            fill="#15803d"
          />
          <path
            d="M36,46 Q42,52 46,45"
            stroke="#451a03"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M44,50 Q49,47 54,50"
            stroke="#451a03"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M66,50 Q71,47 76,50"
            stroke="#451a03"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="49" cy="56" r="3.2" fill="#1e293b" />
          <circle cx="71" cy="56" r="3.2" fill="#1e293b" />
          <circle cx="50" cy="55" r="1.1" fill="#ffffff" />
          <circle cx="72" cy="55" r="1.1" fill="#ffffff" />
          <path
            d="M49,69 Q60,77 71,69"
            stroke="#7c2d12"
            strokeWidth="2.8"
            fill="#ffffff"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'ortacha_aka':
      return (
        <svg
          viewBox="0 0 120 120"
          className={`overflow-hidden shrink-0 ${className}`}
        >
          <defs>
            <radialGradient id="bg-ortacha" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#091526" />
            </radialGradient>
          </defs>
          <rect width="120" height="120" fill="url(#bg-ortacha)" />
          <path d="M16,120 C20,86 100,86 104,120 Z" fill="#4c1d95" />
          <path
            d="M42,88 L60,120 L78,88"
            stroke="#f59e0b"
            strokeWidth="4"
            fill="#f8fafc"
          />
          <rect x="51" y="75" width="18" height="18" rx="6" fill="#e59866" />
          <ellipse cx="60" cy="56" rx="25" ry="26" fill="#edbb99" />
          <path
            d="M35,43 C36,25 84,25 85,43 Z"
            fill="#111827"
            stroke="#f8fafc"
            strokeWidth="1.5"
          />
          <path
            d="M43,36 Q48,30 53,36 M67,36 Q72,30 77,36 M55,34 Q60,28 65,34"
            stroke="#f8fafc"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M42,49 Q48,45 55,49"
            stroke="#1f2937"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M65,49 Q72,45 78,49"
            stroke="#1f2937"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="49" cy="55" r="3" fill="#111827" />
          <circle cx="71" cy="55" r="3" fill="#111827" />
          <path
            d="M45,67 Q53,62 60,66 Q67,62 75,67 Q67,71 60,68 Q53,71 45,67 Z"
            fill="#1f2937"
          />
          <path
            d="M52,72 Q60,76 68,72"
            stroke="#7c2d12"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'kuchli_ota':
      return (
        <svg
          viewBox="0 0 120 120"
          className={`overflow-hidden shrink-0 ${className}`}
        >
          <defs>
            <radialGradient id="bg-kuchli" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#09101d" />
            </radialGradient>
          </defs>
          <rect width="120" height="120" fill="url(#bg-kuchli)" />
          <path
            d="M16,120 C20,86 100,86 104,120 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <path d="M45,88 L60,116 L75,88 Z" fill="#0f172a" />
          <rect x="51" y="75" width="18" height="16" rx="5" fill="#d5a67d" />
          <ellipse cx="60" cy="56" rx="24" ry="26" fill="#e0b589" />
          <path
            d="M36,56 C36,78 48,86 60,86 C72,86 84,78 84,56 C80,68 72,73 60,73 C48,73 40,68 36,56 Z"
            fill="#94a3b8"
          />
          <path
            d="M45,68 Q60,63 75,68"
            stroke="#64748b"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M36,42 C37,24 83,24 84,42 Z"
            fill="#0f172a"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <path
            d="M44,35 Q49,29 54,35 M66,35 Q71,29 76,35"
            stroke="#e2e8f0"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M42,48 L55,51"
            stroke="#475569"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M78,48 L65,51"
            stroke="#475569"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="49" cy="55" r="2.8" fill="#0f172a" />
          <circle cx="71" cy="55" r="2.8" fill="#0f172a" />
        </svg>
      );

    case 'usta_bobo':
      return (
        <svg
          viewBox="0 0 120 120"
          className={`overflow-hidden shrink-0 ${className}`}
        >
          <defs>
            <radialGradient id="bg-usta" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#422006" />
              <stop offset="100%" stopColor="#091322" />
            </radialGradient>
          </defs>
          <rect width="120" height="120" fill="url(#bg-usta)" />
          <path
            d="M14,120 C18,86 102,86 106,120 Z"
            fill="#78350f"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <path
            d="M42,88 L60,120 L78,88"
            stroke="#fbbf24"
            strokeWidth="4"
            fill="#451a03"
          />
          <ellipse cx="60" cy="55" rx="23" ry="25" fill="#e6b88a" />
          <path
            d="M36,56 C35,84 48,96 60,96 C72,96 85,84 84,56 C78,70 70,74 60,74 C50,74 42,70 36,56 Z"
            fill="#f1f5f9"
          />
          <path
            d="M44,67 Q60,62 76,67"
            stroke="#cbd5e1"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M36,42 C36,22 84,22 84,42 Z"
            fill="#b45309"
            stroke="#fde68a"
            strokeWidth="2"
          />
          <path
            d="M42,36 Q60,26 78,36"
            stroke="#fef08a"
            strokeWidth="2.2"
            fill="none"
          />
          <path
            d="M41,48 Q48,44 55,49"
            stroke="#f8fafc"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M65,49 Q72,44 79,48"
            stroke="#f8fafc"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="49" cy="55" r="2.7" fill="#0f172a" />
          <circle cx="71" cy="55" r="2.7" fill="#0f172a" />
        </svg>
      );

    case 'bot_robo':
    default:
      return (
        <svg
          viewBox="0 0 100 100"
          className={`rounded-full overflow-hidden shrink-0 ${className}`}
        >
          <rect width="100" height="100" fill="#A3C9A8" />
          <path d="M22,100 C25,76 75,76 78,100 Z" fill="#475569" />
          <line
            x1="50"
            y1="14"
            x2="50"
            y2="26"
            stroke="#64748b"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="50" cy="12" r="4.5" fill="#0284c7" />
          <rect
            x="24"
            y="26"
            width="52"
            height="44"
            rx="16"
            fill="#f8fafc"
            stroke="#475569"
            strokeWidth="3"
          />
          <rect x="31" y="36" width="38" height="20" rx="8" fill="#0f172a" />
          <circle cx="41" cy="46" r="4.5" fill="#38bdf8" />
          <circle cx="59" cy="46" r="4.5" fill="#38bdf8" />
          <path
            d="M43,62 Q50,66 57,62"
            stroke="#475569"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};
