import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  MoreVertical,
  Sparkles,
  Trophy,
  Send,
  X,
  RotateCcw,
  Award,
  MessageCircle,
  Camera,
} from 'lucide-react';
import {
  Card,
  Suit,
  BotDifficulty,
  SUIT_INFO,
  createDeck,
  detectSpecialCombinations,
  validateLeadCards,
  validateFollowCards,
  doesPlayBeatCurrentBest,
  calculateCardsPoints,
  calculatePenaltyPoints,
  chooseBotMove,
  refillHandsEqually,
  findNextPlayerWithCards,
  SpecialCombination,
} from '../rules/burkozelRules';
import { PlayingCard } from './PlayingCard';
import { AvatarIllustration, AvatarId } from './AvatarIllustration';
import { soundFX } from '../utils/sound';
import { processProfileImageFile } from '../utils/imageUpload';
import {
  multiplayerClient,
  RemotePlayerProfile,
} from '../utils/socketClient';

export interface PlayerState {
  id: number;
  userId?: string;
  name: string;
  avatar: AvatarId;
  photoUrl?: string | null;
  isHuman: boolean;
  teamId?: number;
  hand: Card[];
  roundPoints: number;
  tricksWon: number;
  penaltyPoints: number;
}

export interface TableThrow {
  id: string;
  playerId: number;
  playerName: string;
  seatPosition: 'bottom' | 'top' | 'left' | 'right';
  cards: Card[];
  beatenPrevious: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderPhotoUrl?: string | null;
  text: string;
  time: string;
}

interface GameTableViewProps {
  roomTitle: string;
  playerName: string;
  playerPhotoUrl: string | null;
  onlinePlayers: RemotePlayerProfile[];
  currentUserId: string;
  playerCount: 2 | 3 | 4;
  isPairMode: boolean;
  difficulty: BotDifficulty;
  autoSortHand: boolean;
  onChangePlayerPhoto: (dataUrl: string | null) => void;
  onExitToMenu: () => void;
  onRewardCoins: (amount: number) => void;
}

const QUICK_PHRASES = [
  'Omad yor bo‘lsin!',
  'Yaxshi yurish!',
  'Kozirdan yuring!',
  'Menda Bura!',
  'Tezroq yuring 😊',
  'Rahmat!',
];

const AnimatedScoreCounter: React.FC<{ value: number; suffix?: string }> = ({
  value,
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    if (value === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 800;
    const stepTime = 24;
    const totalSteps = Math.max(1, Math.floor(duration / stepTime));
    const increment = value / totalSteps;

    const timer = window.setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        window.clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  );
};

export const GameTableView: React.FC<GameTableViewProps> = ({
  roomTitle,
  playerName,
  playerPhotoUrl,
  onlinePlayers,
  currentUserId,
  playerCount,
  isPairMode,
  difficulty,
  autoSortHand,
  onChangePlayerPhoto,
  onExitToMenu,
  onRewardCoins,
}) => {
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [deck, setDeck] = useState<Card[]>([]);
  const [trumpCard, setTrumpCard] = useState<Card | null>(null);
  const [trumpSuit, setTrumpSuit] = useState<Suit>('hearts');
  const [players, setPlayers] = useState<PlayerState[]>([]);

  // Turn & Trick State
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [leadPlayerIndex, setLeadPlayerIndex] = useState<number>(0);
  const [winningPlayerIndex, setWinningPlayerIndex] = useState<number>(0);
  const [winningCards, setWinningCards] = useState<Card[]>([]);
  const [tableThrows, setTableThrows] = useState<TableThrow[]>([]);
  const [isResolvingTrick, setIsResolvingTrick] = useState<boolean>(false);
  const [trickCollectorSeat, setTrickCollectorSeat] = useState<
    'bottom' | 'top' | 'left' | 'right' | null
  >(null);

  // Human Player Selection & Combos
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [activeCombos, setActiveCombos] = useState<SpecialCombination[]>([]);
  const [declaredComboBanner, setDeclaredComboBanner] = useState<string | null>(
    null
  );

  // Modals
  const [showRoundModal, setShowRoundModal] = useState<boolean>(false);
  const [isMatchOver, setIsMatchOver] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showScoreDrawer, setShowScoreDrawer] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Aziz',
      text: 'Assalomu alaykum, hammaga omad!',
      time: 'Hozir',
    },
  ]);

  const botTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Always keep a ref to latest state so async bot callbacks never read stale closures
  const stateRef = useRef({
    players,
    deck,
    turnIndex,
    leadPlayerIndex,
    winningPlayerIndex,
    winningCards,
    tableThrows,
    trumpSuit,
    isResolvingTrick,
    showRoundModal,
  });
  stateRef.current = {
    players,
    deck,
    turnIndex,
    leadPlayerIndex,
    winningPlayerIndex,
    winningCards,
    tableThrows,
    trumpSuit,
    isResolvingTrick,
    showRoundModal,
  };

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processProfileImageFile(file);
      onChangePlayerPhoto(dataUrl);
    } catch {}
    e.target.value = '';
  };

  // Sync human player's photo & other connected online players' photos into the active seats in real time
  useEffect(() => {
    setPlayers((prev) => {
      if (prev.length === 0) return prev;
      const otherHumans = onlinePlayers.filter(
        (op) => op.userId !== currentUserId
      );
      return prev.map((p, idx) => {
        if (idx === 0) {
          return {
            ...p,
            name:
              playerName && playerName !== 'Jasurbek' ? playerName : p.name,
            photoUrl: playerPhotoUrl,
          };
        }
        const remotePeer = otherHumans[idx - 1];
        if (remotePeer) {
          return {
            ...p,
            userId: remotePeer.userId,
            name: remotePeer.name || p.name,
            photoUrl: remotePeer.photoUrl,
          };
        }
        return p;
      });
    });
  }, [playerPhotoUrl, playerName, onlinePlayers, currentUserId]);

  const getSeatPositionForPlayer = (
    playerId: number
  ): 'bottom' | 'top' | 'left' | 'right' => {
    if (playerId === 0) return 'bottom';
    if (playerCount === 2) return 'top';
    if (playerCount === 3) return playerId === 1 ? 'left' : 'right';
    if (playerId === 1) return 'left';
    if (playerId === 2) return 'top';
    return 'right';
  };

  const getSeatCoordinates = (
    seat: 'bottom' | 'top' | 'left' | 'right'
  ): { x: number; y: number; rotate: number } => {
    switch (seat) {
      case 'bottom':
        return { x: 0, y: 120, rotate: 0 };
      case 'top':
        return { x: 0, y: -120, rotate: 0 };
      case 'left':
        return { x: -115, y: 0, rotate: 0 };
      case 'right':
        return { x: 115, y: 0, rotate: 0 };
    }
  };

  useEffect(() => {
    startNewMatch();
    return () => {
      if (botTimerRef.current) window.clearTimeout(botTimerRef.current);
    };
  }, [playerCount, isPairMode, difficulty]);

  const sortHandCards = (cards: Card[], tSuit: Suit): Card[] => {
    if (!autoSortHand) return cards;
    return [...cards].sort((a, b) => {
      const aTrump = a.suit === tSuit ? 1 : 0;
      const bTrump = b.suit === tSuit ? 1 : 0;
      if (aTrump !== bTrump) return bTrump - aTrump;
      if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
      return b.strength - a.strength;
    });
  };

  const buildInitialPlayers = (): PlayerState[] => {
    const botProfiles: { name: string; avatar: AvatarId }[] =
      playerCount === 2
        ? [{ name: 'Aziz', avatar: 'aziz' }]
        : playerCount === 3
        ? [
            { name: 'Malika', avatar: 'malika' },
            { name: 'Sardor', avatar: 'sardor' },
          ]
        : [
            { name: 'Malika', avatar: 'malika' },
            { name: 'Aziz', avatar: 'aziz' },
            { name: 'Sardor', avatar: 'sardor' },
          ];

    const humanDisplayName =
      playerName && playerName !== 'Jasurbek' ? playerName : 'Javohir';

    const otherHumans = onlinePlayers.filter(
      (op) => op.userId !== currentUserId
    );

    const list: PlayerState[] = [
      {
        id: 0,
        userId: currentUserId,
        name: humanDisplayName,
        avatar: 'javohir',
        photoUrl: playerPhotoUrl,
        isHuman: true,
        teamId: isPairMode && playerCount === 4 ? 0 : undefined,
        hand: [],
        roundPoints: 0,
        tricksWon: 0,
        penaltyPoints: 0,
      },
    ];

    botProfiles.forEach((bp, idx) => {
      const pid = idx + 1;
      const remotePeer = otherHumans[idx];
      list.push({
        id: pid,
        userId: remotePeer?.userId,
        name: remotePeer?.name || bp.name,
        avatar: bp.avatar,
        photoUrl: remotePeer?.photoUrl || null,
        isHuman: false,
        teamId:
          isPairMode && playerCount === 4
            ? pid % 2 === 0
              ? 0
              : 1
            : undefined,
        hand: [],
        roundPoints: 0,
        tricksWon: 0,
        penaltyPoints: 0,
      });
    });

    return list;
  };

  const startNewMatch = () => {
    if (botTimerRef.current) window.clearTimeout(botTimerRef.current);
    const freshPlayers = buildInitialPlayers();
    setRoundNumber(1);
    setIsMatchOver(false);
    dealRound(freshPlayers, 0);
  };

  /**
   * 32 talik kolodadan har bir o‘yinchiga 1 tadan aylantirib 4 tadan karta tarqatish.
   * 4 kishilik o‘yinda 4 * 4 = 16 ta karta tarqatiladi va kolodada aniq 16 ta karta qoladi.
   */
  const dealRound = (currentPlayers: PlayerState[], starterIdx: number) => {
    if (botTimerRef.current) window.clearTimeout(botTimerRef.current);

    const fullDeck = createDeck(); // 32 ta karta (7..A)
    const emptyPlayers = currentPlayers.map((p) => ({
      ...p,
      hand: [] as Card[],
      roundPoints: 0,
      tricksWon: 0,
    }));

    // Round-robin tarqatish: starterIdx dan boshlab har bir o'yinchiga 4 tagacha
    const { updatedPlayers, remainingDeck: afterDealDeck } = refillHandsEqually(
      emptyPlayers,
      fullDeck,
      starterIdx,
      4
    );

    // Keyingi karta kozir mastini belgilaydi va kolodaning eng oxiriga ochiq qo'yiladi
    const revealedTrump = afterDealDeck[0];
    const remainingDeck =
      afterDealDeck.length > 0
        ? [...afterDealDeck.slice(1), revealedTrump]
        : [];
    const tSuit = revealedTrump ? revealedTrump.suit : 'hearts';

    const sortedPlayers = updatedPlayers.map((p) => ({
      ...p,
      hand: p.isHuman ? sortHandCards(p.hand, tSuit) : p.hand,
    }));

    // Navbat faqat qo‘lida kamida 1 ta karta bor o‘yinchiga beriladi
    const validStarter =
      findNextPlayerWithCards(sortedPlayers, starterIdx) ?? 0;

    setDeck(remainingDeck);
    setTrumpCard(revealedTrump || null);
    setTrumpSuit(tSuit);
    setPlayers(sortedPlayers);
    setTurnIndex(validStarter);
    setLeadPlayerIndex(validStarter);
    setWinningPlayerIndex(validStarter);
    setWinningCards([]);
    setTableThrows([]);
    setSelectedCardIds([]);
    setIsResolvingTrick(false);
    setTrickCollectorSeat(null);
    setShowRoundModal(false);
    setErrorBanner(null);

    const humanCombos = detectSpecialCombinations(sortedPlayers[0].hand, tSuit);
    setActiveCombos(humanCombos);
  };

  // Qo‘ldagi kartalar o‘zgarganda tanlangan kartalarni haqiqiy qo‘l bilan sinxronlash
  useEffect(() => {
    if (players.length > 0) {
      const humanHandIds = new Set(players[0].hand.map((c) => c.id));
      setSelectedCardIds((prev) => prev.filter((id) => humanHandIds.has(id)));

      if (players[0].hand.length >= 3) {
        setActiveCombos(detectSpecialCombinations(players[0].hand, trumpSuit));
      } else {
        setActiveCombos([]);
      }
    }
  }, [players, trumpSuit]);

  // Himoya tekshiruvi: Agar joriy turnIndex dagi o‘yinchining qo‘lida 0 ta karta bo‘lsa:
  // - Agar hech kimda karta qolmagan va stolda yurish bo‘lmasa -> raundni yakunla
  // - Aks holda qo‘lida kartasi bor keyingi o‘yinchiga navbatni o‘tkaz
  useEffect(() => {
    if (players.length === 0 || showRoundModal || isResolvingTrick) return;

    const currentPlayer = players[turnIndex];
    if (!currentPlayer) return;

    if (currentPlayer.hand.length === 0) {
      const playedIds = new Set(tableThrows.map((t) => t.playerId));
      const nextActive = findNextPlayerWithCards(
        players,
        (turnIndex + 1) % playerCount,
        playedIds
      );

      if (nextActive === null) {
        if (tableThrows.length > 0) {
          // Stolda tashlangan kartalar bor — yurishni yakunla
          setIsResolvingTrick(true);
          const winnerSeat = getSeatPositionForPlayer(winningPlayerIndex);
          window.setTimeout(() => setTrickCollectorSeat(winnerSeat), 550);
          window.setTimeout(() => {
            resolveCompletedTrick(
              players,
              deck,
              tableThrows,
              winningPlayerIndex,
              leadPlayerIndex
            );
          }, 950);
        } else {
          // Hech kimda karta qolmadi — raundni yakunla
          finalizeRound(players);
        }
      } else {
        setTurnIndex(nextActive);
      }
    }
  }, [turnIndex, players, tableThrows, showRoundModal, isResolvingTrick]);

  // Bot Turn Automation
  useEffect(() => {
    if (
      players.length === 0 ||
      showRoundModal ||
      isResolvingTrick ||
      turnIndex === 0
    ) {
      return;
    }

    const currentBot = players[turnIndex];
    if (!currentBot || currentBot.isHuman || currentBot.hand.length === 0) {
      return;
    }

    botTimerRef.current = window.setTimeout(() => {
      const st = stateRef.current;
      const botNow = st.players[st.turnIndex];
      if (
        !botNow ||
        botNow.isHuman ||
        botNow.hand.length === 0 ||
        st.isResolvingTrick ||
        st.showRoundModal
      ) {
        return;
      }

      const isLeading = st.tableThrows.length === 0;
      const allTableCards = st.tableThrows.flatMap((t) => t.cards);

      // Stoldagi faol o'yinchilar qo'lidagi eng kam karta soni (ortiqcha karta tashlamaslik uchun)
      const activePlayersWithCards = st.players.filter(
        (p) => p.hand.length > 0
      );
      const maxLeadAllowed =
        activePlayersWithCards.length > 0
          ? Math.min(...activePlayersWithCards.map((p) => p.hand.length))
          : 1;

      const botCombos = detectSpecialCombinations(botNow.hand, st.trumpSuit);
      if (botCombos.length > 0 && isLeading) {
        setDeclaredComboBanner(`${botNow.name}: "${botCombos[0].name}"`);
        soundFX.playSpecialCombo();
        setTimeout(() => setDeclaredComboBanner(null), 2200);
      }

      const chosenCards = chooseBotMove(
        botNow.hand,
        isLeading,
        isLeading ? null : st.winningCards,
        allTableCards,
        st.trumpSuit,
        difficulty,
        maxLeadAllowed
      );

      if (chosenCards.length > 0) {
        executeCardPlay(st.turnIndex, chosenCards);
      }
    }, 750);

    return () => {
      if (botTimerRef.current) window.clearTimeout(botTimerRef.current);
    };
  }, [
    turnIndex,
    tableThrows.length,
    isResolvingTrick,
    showRoundModal,
    players,
  ]);

  const toggleCardSelection = (cardId: string) => {
    const human = players[0];
    if (
      turnIndex !== 0 ||
      isResolvingTrick ||
      !human ||
      human.hand.length === 0
    ) {
      return;
    }
    // Karta haqiqatan ham o'yinchi qo'lida borligini tekshirish
    if (!human.hand.some((c) => c.id === cardId)) return;

    soundFX.playCardSelect();
    setErrorBanner(null);

    setSelectedCardIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleHumanPlayCards = () => {
    const human = players[0];
    // 1. O'yinchi navbati ekanini va qo'lida karta borligini qat'iy tekshirish
    if (turnIndex !== 0 || isResolvingTrick || !human) return;
    if (human.hand.length === 0) {
      setErrorBanner(null);
      return;
    }

    // 2. Tanlangan kartalar haqiqatan ham o'yinchi qo'lida borligini tasdiqlash
    const selectedCards = human.hand.filter((c) =>
      selectedCardIds.includes(c.id)
    );
    if (selectedCards.length !== selectedCardIds.length) {
      setSelectedCardIds(selectedCards.map((c) => c.id));
      return;
    }

    const isLeading = tableThrows.length === 0;

    if (isLeading) {
      const activePlayersWithCards = players.filter((p) => p.hand.length > 0);
      const maxAllowedLead =
        activePlayersWithCards.length > 0
          ? Math.min(...activePlayersWithCards.map((p) => p.hand.length))
          : human.hand.length;

      const check = validateLeadCards(
        selectedCards,
        trumpSuit,
        maxAllowedLead
      );
      if (!check.valid) {
        soundFX.playError();
        setErrorBanner(check.reason || 'Noto‘g‘ri yurish!');
        return;
      }
    } else {
      const requiredCount = winningCards.length;
      const check = validateFollowCards(
        selectedCards,
        requiredCount,
        human.hand.length
      );
      if (!check.valid) {
        soundFX.playError();
        setErrorBanner(check.reason || 'Kartalar soni mos emas!');
        return;
      }
    }

    setSelectedCardIds([]);
    setErrorBanner(null);
    executeCardPlay(0, selectedCards);
  };

  const handleDeclareCombo = (combo: SpecialCombination) => {
    soundFX.playSpecialCombo();
    setDeclaredComboBanner(`Siz e’lon qildingiz: ${combo.name}`);
    setTimeout(() => setDeclaredComboBanner(null), 2500);

    if (
      turnIndex === 0 &&
      tableThrows.length === 0 &&
      players[0]?.hand.length > 0
    ) {
      setSelectedCardIds(players[0].hand.map((c) => c.id));
    }
  };

  const executeCardPlay = (playerIdx: number, playedCards: Card[]) => {
    const currentPlayers = stateRef.current.players;
    const currentThrows = stateRef.current.tableThrows;
    const currentDeck = stateRef.current.deck;
    const currentWinningIdx = stateRef.current.winningPlayerIndex;
    const currentWinning = stateRef.current.winningCards;
    const currentLeadIdx = stateRef.current.leadPlayerIndex;

    const actingPlayer = currentPlayers[playerIdx];
    // Karta tashlashdan oldin o'yinchi navbati va kartalar uning qo'lida borligini tekshirish
    if (
      !actingPlayer ||
      playerIdx !== stateRef.current.turnIndex ||
      playedCards.length === 0
    ) {
      return;
    }

    const handIds = new Set(actingPlayer.hand.map((c) => c.id));
    const allCardsInHand = playedCards.every((pc) => handIds.has(pc.id));
    if (!allCardsInHand) {
      return;
    }

    soundFX.playCardThrow();
    const isLeading = currentThrows.length === 0;

    let newWinningPlayerIdx = currentWinningIdx;
    let newWinningCards = currentWinning;
    let beatenPrev = false;

    if (isLeading) {
      newWinningPlayerIdx = playerIdx;
      newWinningCards = playedCards;
      beatenPrev = true;
    } else {
      const beats = doesPlayBeatCurrentBest(
        playedCards,
        currentWinning,
        trumpSuit
      );
      if (beats) {
        newWinningPlayerIdx = playerIdx;
        newWinningCards = playedCards;
        beatenPrev = true;
      }
    }

    const updatedPlayers = currentPlayers.map((p, idx) => {
      if (idx !== playerIdx) return p;
      const playedSet = new Set(playedCards.map((pc) => pc.id));
      const remaining = p.hand.filter((c) => !playedSet.has(c.id));
      return { ...p, hand: remaining };
    });

    const nextThrows: TableThrow[] = [
      ...currentThrows,
      {
        id: `${playerIdx}_${Date.now()}`,
        playerId: playerIdx,
        playerName: actingPlayer.name,
        seatPosition: getSeatPositionForPlayer(playerIdx),
        cards: playedCards,
        beatenPrevious: beatenPrev,
      },
    ];

    // Ushbu vzyatkada hali yurmagan va qo'lida kamida 1 ta kartasi bor keyingi o'yinchini topamiz
    const playedPlayerIds = new Set(nextThrows.map((t) => t.playerId));
    const nextTurnPlayerIdx =
      nextThrows.length >= playerCount
        ? null
        : findNextPlayerWithCards(
            updatedPlayers,
            (playerIdx + 1) % playerCount,
            playedPlayerIds
          );

    setPlayers(updatedPlayers);
    setTableThrows(nextThrows);
    setWinningPlayerIndex(newWinningPlayerIdx);
    setWinningCards(newWinningCards);

    // Agar barcha kartasi bor o'yinchilar yurib bo'lgan bo'lsa, vzyatkani yakunlaymiz
    if (nextTurnPlayerIdx === null) {
      setIsResolvingTrick(true);
      const winnerSeat = getSeatPositionForPlayer(newWinningPlayerIdx);

      window.setTimeout(() => {
        setTrickCollectorSeat(winnerSeat);
      }, 650);

      window.setTimeout(() => {
        resolveCompletedTrick(
          updatedPlayers,
          currentDeck,
          nextThrows,
          newWinningPlayerIdx,
          currentLeadIdx
        );
      }, 1100);
    } else {
      setTurnIndex(nextTurnPlayerIdx);
    }
  };

  const resolveCompletedTrick = (
    currentPlayers: PlayerState[],
    currentDeck: Card[],
    completedThrows: TableThrow[],
    trickWinnerIdx: number,
    _trickLeaderIdx: number
  ) => {
    soundFX.playTrickWin();

    const allTrickCards = completedThrows.flatMap((t) => t.cards);
    const trickPoints = calculateCardsPoints(allTrickCards);

    const playersWithPoints = currentPlayers.map((p, idx) => {
      if (idx !== trickWinnerIdx) return p;
      return {
        ...p,
        roundPoints: p.roundPoints + trickPoints,
        tricksWon: p.tricksWon + 1,
      };
    });

    // Yurish yutib olingach, kolodada karta bor bo'lsa, o'yinchilar qo'lini
    // navbat tartibida (1 tadan aylantirib) 4 tagacha to'ldiradi.
    // Koloda tugagach, yangi karta tarqatilmaydi.
    const { updatedPlayers: refilledRaw, remainingDeck } = refillHandsEqually(
      playersWithPoints,
      currentDeck,
      trickWinnerIdx,
      4
    );

    const refilledPlayers = refilledRaw.map((p) => ({
      ...p,
      hand: p.isHuman ? sortHandCards(p.hand, trumpSuit) : p.hand,
    }));

    // Agar hech bir o'yinchida karta qolmagan bo'lsa, raundni yakunlaymiz
    const nextLeaderIdx = findNextPlayerWithCards(
      refilledPlayers,
      trickWinnerIdx
    );

    if (nextLeaderIdx === null) {
      setDeck(remainingDeck);
      setPlayers(refilledPlayers);
      setTrickCollectorSeat(null);
      finalizeRound(refilledPlayers);
      return;
    }

    setDeck(remainingDeck);
    setPlayers(refilledPlayers);
    setTableThrows([]);
    setWinningCards([]);
    setLeadPlayerIndex(nextLeaderIdx);
    setWinningPlayerIndex(nextLeaderIdx);
    setTurnIndex(nextLeaderIdx);
    setTrickCollectorSeat(null);
    setIsResolvingTrick(false);
  };

  const finalizeRound = (endPlayers: PlayerState[]) => {
    let matchEnded = false;

    const scoredPlayers = endPlayers.map((p) => {
      let effectivePoints = p.roundPoints;
      let effectiveTricks = p.tricksWon;

      if (isPairMode && playerCount === 4 && p.teamId !== undefined) {
        const teamMembers = endPlayers.filter((tm) => tm.teamId === p.teamId);
        effectivePoints = teamMembers.reduce((s, tm) => s + tm.roundPoints, 0);
        effectiveTricks = teamMembers.reduce((s, tm) => s + tm.tricksWon, 0);
      }

      const { penalty } = calculatePenaltyPoints(
        effectivePoints,
        effectiveTricks
      );
      const nextPenaltyTotal = p.penaltyPoints + penalty;
      if (nextPenaltyTotal >= 12) {
        matchEnded = true;
      }

      return {
        ...p,
        penaltyPoints: nextPenaltyTotal,
      };
    });

    const humanPerf = calculatePenaltyPoints(
      isPairMode && playerCount === 4
        ? endPlayers
            .filter((p) => p.teamId === 0)
            .reduce((s, m) => s + m.roundPoints, 0)
        : endPlayers[0].roundPoints,
      isPairMode && playerCount === 4
        ? endPlayers
            .filter((p) => p.teamId === 0)
            .reduce((s, m) => s + m.tricksWon, 0)
        : endPlayers[0].tricksWon
    );
    if (humanPerf.penalty === 0) {
      onRewardCoins(150);
    }

    setPlayers(scoredPlayers);
    setTableThrows([]);
    setIsResolvingTrick(false);
    setIsMatchOver(matchEnded);
    setShowRoundModal(true);
  };

  const handleSendChat = (textToSend?: string) => {
    const content = (textToSend ?? chatInput).trim();
    if (!content) return;

    const sent = multiplayerClient.sendChatMessage(
      roomTitle,
      playerName || 'Javohir',
      playerPhotoUrl,
      content
    );

    setMessages((prev) => [...prev, sent]);
    setChatInput('');
  };

  const getOpponentLayout = () => {
    if (players.length < 2) return { top: null, left: null, right: null };
    if (playerCount === 2) {
      return { top: players[1], left: null, right: null };
    }
    if (playerCount === 3) {
      return { top: null, left: players[1], right: players[2] };
    }
    return { top: players[2], left: players[1], right: players[3] };
  };

  const { top: topOpponent, left: leftOpponent, right: rightOpponent } =
    getOpponentLayout();
  const humanPlayer = players[0];
  const humanCardCount = humanPlayer ? humanPlayer.hand.length : 0;
  const isHumanActiveTurn =
    turnIndex === 0 && !isResolvingTrick && !showRoundModal && humanCardCount > 0;

  const ourScore =
    players.length > 0
      ? isPairMode && playerCount === 4
        ? players
            .filter((p) => p.teamId === 0)
            .reduce((s, p) => s + p.roundPoints, 0)
        : players[0]?.roundPoints || 0
      : 0;

  const opponentScore =
    players.length > 1
      ? isPairMode && playerCount === 4
        ? players
            .filter((p) => p.teamId === 1)
            .reduce((s, p) => s + p.roundPoints, 0)
        : Math.max(...players.slice(1).map((p) => p.roundPoints), 0)
      : 0;

  // Render opponent avatar + pill + blue card fan on the outer rim of the table
  const renderOpponentOnEdge = (
    opp: PlayerState | null,
    position: 'top' | 'left' | 'right'
  ) => {
    if (!opp) return null;
    const isTurn =
      turnIndex === opp.id && !showRoundModal && opp.hand.length > 0;
    const cardFanCount = opp.hand.length;

    const posClasses = {
      top: '-top-2.5 left-1/2 -translate-x-1/2',
      left: 'left-1 top-[44%] -translate-y-1/2',
      right: 'right-1 top-[44%] -translate-y-1/2',
    }[position];

    return (
      <div
        className={`absolute ${posClasses} z-20 flex flex-col items-center select-none`}
      >
        <motion.div
          animate={{ scale: isTurn ? 1.07 : 1 }}
          className={`w-11 h-11 rounded-full border-2 ${
            isTurn
              ? 'border-amber-300 ring-3 ring-amber-400/50'
              : 'border-white'
          } shadow-md overflow-hidden bg-[#A3C9A8]`}
        >
          <AvatarIllustration
            id={opp.avatar}
            customPhotoUrl={opp.photoUrl}
            className="w-full h-full"
          />
        </motion.div>

        {/* Name Pill + Exact Hand Card Count */}
        <div className="-mt-1.5 z-10 flex items-center rounded-md overflow-hidden shadow-md border border-[#0B3B24]">
          <span className="bg-[#0B462B] text-white font-bold text-[10px] px-1.5 py-0.5 leading-tight max-w-[68px] truncate">
            {opp.name}
          </span>
          <span className="bg-[#052315] text-white font-extrabold text-[10px] px-1.5 py-0.5 leading-tight tabular-nums">
            {cardFanCount}
          </span>
        </div>

        {/* Mini Fanned Blue Cards Below Name Pill (0 cards -> empty) */}
        <div className="relative flex items-center justify-center h-7 w-14 mt-0.5">
          {Array.from({ length: cardFanCount }).map((_, idx) => {
            const offsetX = (idx - (cardFanCount - 1) / 2) * 5.5;
            const rotateAngle = (idx - (cardFanCount - 1) / 2) * 4;
            return (
              <div
                key={idx}
                style={{
                  transform: `translateX(${offsetX}px) rotate(${rotateAngle}deg)`,
                }}
                className="absolute w-6 h-8 rounded bg-[#4A78A8] border border-white shadow-xs overflow-hidden"
              >
                <div
                  className="w-full h-full opacity-60"
                  style={{
                    backgroundImage:
                      'radial-gradient(#ffffff 0.75px, transparent 0.75px)',
                    backgroundSize: '4px 4px',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getThrownPlayForSeat = (
    seat: 'top' | 'left' | 'right' | 'bottom'
  ): TableThrow | undefined => {
    return tableThrows.find((t) => t.seatPosition === seat);
  };

  const renderCenterSlotCard = (seat: 'top' | 'left' | 'right' | 'bottom') => {
    const play = getThrownPlayForSeat(seat);
    const origin = getSeatCoordinates(seat);
    const collectTarget = trickCollectorSeat
      ? getSeatCoordinates(trickCollectorSeat)
      : null;

    if (!play) {
      if (seat === 'bottom') {
        return (
          <div className="w-[54px] h-[76px] rounded-xl border border-white/25 bg-white/5 flex items-center justify-center">
            <span className="text-2xl text-white/20">♠</span>
          </div>
        );
      }
      return <div className="w-[54px] h-[76px]" />;
    }

    return (
      <motion.div
        key={play.id}
        initial={{
          opacity: 0,
          x: origin.x,
          y: origin.y,
          scale: 0.6,
        }}
        animate={
          collectTarget
            ? {
                opacity: 0,
                x: collectTarget.x * 0.85,
                y: collectTarget.y * 0.85,
                scale: 0.45,
              }
            : {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
              }
        }
        transition={{
          type: 'spring',
          stiffness: 360,
          damping: 25,
        }}
        className="flex items-center justify-center -space-x-4 z-10"
      >
        {play.cards.map((c) => (
          <PlayingCard
            key={c.id}
            card={c}
            size="sm"
            disabled
            isTrump={c.suit === trumpSuit}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="relative flex flex-col justify-between h-full w-full bg-[#F7F6F0] text-[#111827] overflow-hidden select-none px-1.5 pt-1 pb-1.5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* 1. Compact Header + Score Row */}
      <div className="shrink-0 space-y-0.5 z-30 px-1">
        <div className="flex items-center justify-between h-7">
          <button
            type="button"
            onClick={onExitToMenu}
            aria-label="Orqaga"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-800 hover:bg-black/5 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900">
              Burkozel
            </h1>
            <span className="text-[10px] font-bold text-slate-500 tabular-nums">
              (Koloda: {deck.length})
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setShowChat(true)}
              aria-label="Chat"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:bg-black/5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowScoreDrawer(true)}
              aria-label="Hisob"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-800 hover:bg-black/5 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact 3-Column Score Strip */}
        <div className="grid grid-cols-3 items-center bg-[#EFECE3] border border-[#E2DDD0] rounded-xl py-0.5 px-2">
          <div className="text-center border-r border-[#DCD6C6]">
            <div className="text-[10px] font-medium text-slate-600 leading-tight">
              Bizning hisob
            </div>
            <div className="text-xs font-extrabold text-slate-900 tabular-nums leading-tight">
              {ourScore}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="px-2 py-0.5 rounded-lg bg-[#E5E0D3] flex items-center gap-1">
              <span className="text-[11px] font-extrabold text-slate-900">
                Kozyr:
              </span>
              <span
                className={`text-xs leading-none ${
                  SUIT_INFO[trumpSuit].isRed
                    ? 'text-[#E11D48]'
                    : 'text-slate-900'
                }`}
              >
                {SUIT_INFO[trumpSuit].symbol}
              </span>
            </div>
          </div>

          <div className="text-center border-l border-[#DCD6C6]">
            <div className="text-[10px] font-medium text-slate-600 leading-tight">
              Raqiblar hisobi
            </div>
            <div className="text-xs font-extrabold text-slate-900 tabular-nums leading-tight">
              {opponentScore}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Large Stadium-Oval Green Card Table Maximizing Play Area */}
      <div className="relative flex-1 flex flex-col items-center justify-between mt-2 mb-0.5 min-h-0 w-full">
        <div
          className="relative w-full flex-1 rounded-[128px] p-[8px] flex flex-col justify-between overflow-visible"
          style={{
            background:
              'linear-gradient(180deg, #7C4722 0%, #5B3114 50%, #46230C 100%)',
            boxShadow:
              'inset 0 2px 4px rgba(255,255,255,0.22), 0 6px 18px rgba(0,0,0,0.2)',
          }}
        >
          <div
            className="relative w-full h-full rounded-[120px] border border-[#945B32]/50 flex flex-col items-center justify-between overflow-visible"
            style={{
              background:
                'radial-gradient(ellipse at 50% 48%, #16794B 0%, #0E5C38 68%, #094227 100%)',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.45)',
            }}
          >
            {renderOpponentOnEdge(topOpponent, 'top')}
            {renderOpponentOnEdge(leftOpponent, 'left')}
            {renderOpponentOnEdge(rightOpponent, 'right')}

            {/* Spacious Center Thrown Cards Cross Area */}
            <div className="mt-22 mb-auto flex flex-col items-center justify-center gap-1.5 z-10 pointer-events-none">
              <div className="flex items-center justify-center">
                {renderCenterSlotCard('top')}
              </div>

              <div className="flex items-center justify-center gap-3.5">
                <div className="-mt-3">{renderCenterSlotCard('left')}</div>
                <div className="mt-1">{renderCenterSlotCard('bottom')}</div>
                <div className="-mt-3">{renderCenterSlotCard('right')}</div>
              </div>
            </div>

            {/* Human Player Avatar & Exact Hand Card Count Badge */}
            {humanPlayer && (
              <div className="mb-5 z-20 flex flex-col items-center select-none">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="O‘z rasmingizni qo‘yish uchun bosing"
                  className={`relative w-11 h-11 rounded-full border-2 ${
                    isHumanActiveTurn
                      ? 'border-amber-300 ring-3 ring-amber-300/40'
                      : 'border-white'
                  } shadow-md overflow-visible bg-[#A3C9A8] cursor-pointer group`}
                >
                  <AvatarIllustration
                    id={humanPlayer.avatar}
                    customPhotoUrl={humanPlayer.photoUrl}
                    className="w-full h-full"
                  />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 border border-white flex items-center justify-center text-slate-950 shadow">
                    <Camera className="w-2.5 h-2.5" />
                  </span>
                </button>
                <div className="-mt-1.5 flex items-center rounded-md overflow-hidden shadow-md border border-stone-300 z-10">
                  <span className="bg-white text-slate-900 font-bold text-[10px] px-2 py-0.5 leading-tight max-w-[76px] truncate">
                    {humanPlayer.name}
                  </span>
                  <span className="bg-[#052315] text-white font-extrabold text-[10px] px-1.5 py-0.5 leading-tight tabular-nums">
                    {humanCardCount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Special Combo / Validation Alert Banner */}
        <AnimatePresence>
          {(declaredComboBanner || errorBanner || activeCombos.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-28 z-40 flex flex-col items-center gap-1"
            >
              {(declaredComboBanner || errorBanner) && (
                <div className="px-3 py-1 rounded-xl bg-[#092E1E] border border-amber-400 text-amber-200 text-[11px] font-bold shadow-lg">
                  {errorBanner || declaredComboBanner}
                </div>
              )}
              {activeCombos.length > 0 && (
                <div className="flex gap-1.5">
                  {activeCombos.map((combo) => (
                    <button
                      key={combo.code}
                      type="button"
                      onClick={() => handleDeclareCombo(combo)}
                      className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{combo.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Human Player's Cards Fanned Over Bottom Rim of the Table */}
        <div className="relative -mt-8 z-30 flex items-center justify-center -space-x-2 min-h-[98px] px-2">
          <AnimatePresence mode="popLayout">
            {humanPlayer?.hand.map((card, idx) => {
              const total = humanPlayer.hand.length;
              const angle = (idx - (total - 1) / 2) * 6;
              const archY = Math.abs(idx - (total - 1) / 2) * 3;
              const isSelected = selectedCardIds.includes(card.id);
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: isSelected ? -10 : archY,
                    scale: 1,
                    rotate: isSelected ? 0 : angle,
                  }}
                  exit={{
                    opacity: 0,
                    y: -60,
                    scale: 0.7,
                    transition: { duration: 0.16 },
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 26,
                  }}
                >
                  <PlayingCard
                    card={card}
                    size="lg"
                    selected={isSelected}
                    isTrump={card.suit === trumpSuit}
                    disabled={!isHumanActiveTurn}
                    onClick={() => toggleCardSelection(card.id)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Compact Bottom Controls */}
      <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5 z-30">
        <div className="px-6 py-0.5 rounded-full bg-[#E3EBDD] text-[#0F5338] text-xs font-extrabold tracking-tight">
          {isHumanActiveTurn
            ? 'Navbat: Sizda'
            : `Navbat: ${players[turnIndex]?.name || 'Yakunlanmoqda...'}`}
        </div>

        <motion.button
          type="button"
          whileTap={isHumanActiveTurn ? { scale: 0.98 } : undefined}
          onClick={handleHumanPlayCards}
          disabled={!isHumanActiveTurn}
          className={`w-full h-11 rounded-2xl font-extrabold text-base tracking-tight transition-all shadow-md ${
            isHumanActiveTurn
              ? 'bg-[#0D5C3A] hover:bg-[#0A4B2F] text-white cursor-pointer'
              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
          }`}
        >
          {selectedCardIds.length > 0
            ? `Karta tashlash (${selectedCardIds.length})`
            : 'Karta tashlash'}
        </motion.button>
      </div>

      {/* Round Summary & Match Over Modal */}
      <AnimatePresence>
        {showRoundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="w-full max-w-sm rounded-3xl bg-[#0B192E] border-2 border-amber-400/70 p-5 shadow-2xl space-y-4 text-white"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 mb-2">
                  {isMatchOver ? (
                    <Award className="w-7 h-7" />
                  ) : (
                    <Trophy className="w-6 h-6" />
                  )}
                </div>
                <h2 className="font-display text-xl font-black gold-title">
                  {isMatchOver
                    ? 'O‘YIN YAKUNLANDI'
                    : `${roundNumber}-RAUND YAKUNI`}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {isMatchOver
                    ? '12 jarima ochkosiga yetgan o‘yinchi mag‘lub bo‘ldi!'
                    : 'Har bir o‘yinchining yig‘gan ochkosi va jarima ochkolari:'}
                </p>
              </div>

              <div className="space-y-2.5">
                {players.map((p, idx) => {
                  const effectivePts =
                    isPairMode && playerCount === 4 && p.teamId !== undefined
                      ? players
                          .filter((tm) => tm.teamId === p.teamId)
                          .reduce((s, tm) => s + tm.roundPoints, 0)
                      : p.roundPoints;
                  const effectiveTricks =
                    isPairMode && playerCount === 4 && p.teamId !== undefined
                      ? players
                          .filter((tm) => tm.teamId === p.teamId)
                          .reduce((s, tm) => s + tm.tricksWon, 0)
                      : p.tricksWon;

                  const { penalty, statusLabel } = calculatePenaltyPoints(
                    effectivePts,
                    effectiveTricks
                  );
                  const isLoser = p.penaltyPoints >= 12;
                  const pointPercent = Math.min(
                    100,
                    Math.round((p.roundPoints / 120) * 100)
                  );

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.1 + idx * 0.08,
                        type: 'spring',
                        stiffness: 300,
                        damping: 24,
                      }}
                      className={`p-3 rounded-xl border space-y-2 ${
                        isLoser
                          ? 'bg-red-950/40 border-red-500/60'
                          : p.id === 0
                          ? 'bg-emerald-950/40 border-emerald-500/50'
                          : 'bg-[#071120] border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <AvatarIllustration
                            id={p.avatar}
                            customPhotoUrl={p.photoUrl}
                            className="w-10 h-10"
                          />
                          <div>
                            <div className="text-sm font-extrabold text-white">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {statusLabel} · {p.tricksWon} ta yurish
                            </div>
                          </div>
                        </div>

                        <div className="text-right tabular-nums">
                          <div className="text-sm font-extrabold text-amber-300">
                            <AnimatedScoreCounter
                              value={p.roundPoints}
                              suffix=" ochko"
                            />
                          </div>
                          <div className="text-xs font-bold text-red-300">
                            +{penalty} jarima (Jami: {p.penaltyPoints}/12)
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pointPercent}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.18 + idx * 0.08,
                            ease: 'easeOut',
                          }}
                          className={`h-full rounded-full ${
                            effectivePts >= 61
                              ? 'bg-emerald-400'
                              : effectivePts >= 31
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onExitToMenu}
                  className="flex-1 h-11 rounded-xl btn-navy-panel text-slate-200 font-bold text-xs cursor-pointer"
                >
                  Menyuga qaytish
                </button>

                {isMatchOver ? (
                  <button
                    type="button"
                    onClick={startNewMatch}
                    className="flex-1 h-11 rounded-xl btn-green-glossy text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Yangi o‘yin</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const nextRound = roundNumber + 1;
                      setRoundNumber(nextRound);
                      dealRound(players, (nextRound - 1) % playerCount);
                    }}
                    className="flex-1 h-11 rounded-xl btn-gold-glossy font-extrabold text-xs cursor-pointer"
                  >
                    Keyingi raund
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scoreboard & Profile Photo Drawer */}
      <AnimatePresence>
        {showScoreDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-[#0B192E] border border-amber-400/50 p-4 space-y-3 text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-white font-extrabold text-base">
                  Joriy hisob va profil rasmi
                </h3>
                <button
                  type="button"
                  onClick={() => setShowScoreDrawer(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#071120] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AvatarIllustration
                    id="javohir"
                    customPhotoUrl={playerPhotoUrl}
                    className="w-10 h-10 border border-amber-400"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Sizning rasmingiz
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Barcha o‘yinchilarga ko‘rinadi
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg btn-gold-glossy text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Rasm qo‘yish</span>
                </button>
              </div>

              <div className="space-y-2">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-[#071120] border border-slate-800 flex items-center justify-between text-xs tabular-nums"
                  >
                    <div className="flex items-center gap-2">
                      <AvatarIllustration
                        id={p.avatar}
                        customPhotoUrl={p.photoUrl}
                        className="w-7 h-7"
                      />
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <span className="text-amber-300 font-semibold">
                      Qo‘lda: {p.hand.length} · Ochko: {p.roundPoints} · Jarima:{' '}
                      {p.penaltyPoints}/12
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#071120] border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-amber-300 mb-1">
                  Kolodada qolgan kartalar: {deck.length} ta (32 talik koloda)
                </div>
                {trumpCard && (
                  <div className="text-slate-200">
                    Ochiq kozir karta: {trumpCard.rank}
                    {SUIT_INFO[trumpCard.suit].symbol}
                  </div>
                )}
                <div>Tuz (A) — 11 · O‘nlik (10) — 10 · Qirol (K) — 4</div>
                <div>Dama (Q) — 3 · Valet (J) — 2 · 9, 8, 7 — 0 ochko</div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowScoreDrawer(false);
                    startNewMatch();
                  }}
                  className="flex-1 h-10 rounded-xl btn-navy-panel text-xs font-bold text-amber-300 cursor-pointer"
                >
                  Qayta boshlash
                </button>
                <button
                  type="button"
                  onClick={() => setShowScoreDrawer(false)}
                  className="flex-1 h-10 rounded-xl btn-green-glossy text-xs font-bold text-white cursor-pointer"
                >
                  Davom etish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Chat Drawer */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-3"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-[#0B192E] border border-amber-400/50 p-4 flex flex-col max-h-[80vh] text-white"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-white font-extrabold text-sm">
                  O‘yin chati
                </h3>
                <button
                  type="button"
                  onClick={() => setShowChat(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-[150px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                      m.sender === (playerName || 'Javohir')
                        ? 'bg-blue-900/50 border border-blue-500/40 ml-6'
                        : 'bg-[#071120] border border-slate-800 mr-6'
                    }`}
                  >
                    <AvatarIllustration
                      id="javohir"
                      customPhotoUrl={m.senderPhotoUrl}
                      className="w-7 h-7 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-amber-300 mb-0.5">
                        {m.sender}
                      </div>
                      <div className="text-slate-100">{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 py-2 border-t border-slate-800">
                {QUICK_PHRASES.map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => handleSendChat(phrase)}
                    className="px-2.5 py-1 rounded-lg bg-[#071120] hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-200 cursor-pointer"
                  >
                    {phrase}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Xabar yozing..."
                  className="flex-1 h-10 px-3 rounded-xl bg-[#071120] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleSendChat()}
                  className="w-10 h-10 rounded-xl btn-gold-glossy flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
