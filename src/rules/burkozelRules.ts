/**
 * Burkozel O‘yin Qoidalari va Mantiqiy Moduli
 * 32 talik standart koloda: har bir mastda 7, 8, 9, 10, Valet (J), Dama (Q), Qirol (K) va Tuz (A).
 * 6 liklar kolodaga qo‘shilmaydi.
 * Raund boshida har bir o‘yinchiga 4 tadan karta tarqatiladi (4 kishilik o‘yinda kolodada 16 ta karta qoladi).
 */

export type Suit = 'spades' | 'clubs' | 'diamonds' | 'hearts';
export type Rank = '7' | '8' | '9' | 'J' | 'Q' | 'K' | '10' | 'A';
export type BotDifficulty = 'oson' | 'ortacha' | 'kuchli' | 'usta';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  points: number;
  strength: number; // Karta kuchi: 7 (1) dan A (8) gacha; 10 (7) Qirol (6) dan katta!
}

export interface SpecialCombination {
  code: 'BURA' | 'MOLODKA' | 'MOSKVA' | 'TORTTA_OXIR';
  name: string;
  description: string;
  instantTrickWin: boolean;
  bonusPoints: number;
}

export interface BurkozelRulesConfig {
  deckSize: number;
  handSize: number;
  totalDeckPoints: number;
  maxPenaltyScore: number;
  allowSameRankComboOnLead: boolean;
  penalties: {
    minPointsForZeroPenalty: number; // 61+ ochko -> 0 jarima
    minPointsForTwoPenalty: number;  // 31-60 ochko -> 2 jarima
    zeroPenaltyValue: number;        // 0
    twoPenaltyValue: number;         // 2
    fourPenaltyValue: number;        // 4 (0-30 ochko, kamida 1 ta yurish yutgan)
    sixPenaltyValue: number;         // 6 (birorta ham yurish yutmagan - "quruq")
  };
}

export const DEFAULT_BURKOZEL_CONFIG: BurkozelRulesConfig = {
  deckSize: 32,
  handSize: 4,
  totalDeckPoints: 120,
  maxPenaltyScore: 12,
  allowSameRankComboOnLead: true,
  penalties: {
    minPointsForZeroPenalty: 61,
    minPointsForTwoPenalty: 31,
    zeroPenaltyValue: 0,
    twoPenaltyValue: 2,
    fourPenaltyValue: 4,
    sixPenaltyValue: 6,
  },
};

export const SUIT_INFO: Record<
  Suit,
  { symbol: string; nameUz: string; isRed: boolean }
> = {
  spades: { symbol: '♠', nameUz: 'Qarg‘a', isRed: false },
  clubs: { symbol: '♣', nameUz: 'Chillik', isRed: false },
  diamonds: { symbol: '♦', nameUz: 'G‘ishtin', isRed: true },
  hearts: { symbol: '♥', nameUz: 'Toppon', isRed: true },
};

export const RANK_POINTS: Record<Rank, number> = {
  A: 11,
  '10': 10,
  K: 4,
  Q: 3,
  J: 2,
  '9': 0,
  '8': 0,
  '7': 0,
};

// Burkozelda 10 Qirol, Dama, Valetdan katta turadi (A > 10 > K > Q > J > 9 > 8 > 7)
export const RANK_STRENGTH: Record<Rank, number> = {
  A: 8,
  '10': 7,
  K: 6,
  Q: 5,
  J: 4,
  '9': 3,
  '8': 2,
  '7': 1,
};

export const RANK_NAMES_UZ: Record<Rank, string> = {
  A: 'Tuz',
  '10': 'O‘nlik',
  K: 'Qirol',
  Q: 'Dama',
  J: 'Valet',
  '9': 'To‘qqizlik',
  '8': 'Sakkizlik',
  '7': 'Yettilik',
};

const ALL_SUITS: Suit[] = ['spades', 'clubs', 'diamonds', 'hearts'];
const ALL_RANKS: Rank[] = ['7', '8', '9', 'J', 'Q', 'K', '10', 'A'];

/**
 * 32 talik standart kolodani yaratish va aralashtirish (6 liklarsiz, jami 120 ochko)
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of ALL_SUITS) {
    for (const rank of ALL_RANKS) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        points: RANK_POINTS[rank],
        strength: RANK_STRENGTH[rank],
      });
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Qo‘ldagi kartalardan maxsus kombinatsiyalarni aniqlash:
 * 1. "Bura" — 4 ta kozir karta
 * 2. "To‘rtta oxir" — 4 ta Tuz yoki 4 ta 10
 * 3. "Moskva" — 3 ta Tuz va ulardan biri kozir
 * 4. "Molodka" — Bir xil mastdagi 4 ta karta (kozir bo‘lmagan)
 */
export function detectSpecialCombinations(
  hand: Card[],
  trumpSuit: Suit
): SpecialCombination[] {
  if (hand.length < 3) return [];
  const combos: SpecialCombination[] = [];

  if (hand.length === 4 && hand.every((c) => c.suit === trumpSuit)) {
    combos.push({
      code: 'BURA',
      name: 'Bura!',
      description: 'Qo‘lingizda 4 ta kozir karta bor!',
      instantTrickWin: true,
      bonusPoints: 0,
    });
  } else if (
    hand.length === 4 &&
    hand.every((c) => c.suit === hand[0].suit)
  ) {
    combos.push({
      code: 'MOLODKA',
      name: 'Molodka!',
      description: `Bir xil mastdagi (${SUIT_INFO[hand[0].suit].nameUz}) 4 ta karta!`,
      instantTrickWin: false,
      bonusPoints: 0,
    });
  }

  const aces = hand.filter((c) => c.rank === 'A');
  const tens = hand.filter((c) => c.rank === '10');
  if (aces.length === 4 || tens.length === 4) {
    combos.push({
      code: 'TORTTA_OXIR',
      name: 'To‘rtta oxir!',
      description:
        aces.length === 4
          ? 'Qo‘lingizda 4 ta Tuz yig‘ildi!'
          : 'Qo‘lingizda 4 ta O‘nlik yig‘ildi!',
      instantTrickWin: false,
      bonusPoints: 0,
    });
  } else if (
    aces.length === 3 &&
    aces.some((c) => c.suit === trumpSuit)
  ) {
    combos.push({
      code: 'MOSKVA',
      name: 'Moskva!',
      description: '3 ta Tuz (shu jumladan Kozir Tuz) qo‘lingizda!',
      instantTrickWin: false,
      bonusPoints: 0,
    });
  }

  return combos;
}

/**
 * Birinchi bo‘lib yurayotgan o‘yinchi (lead) tanlagan kartalari qoidaga mosligini tekshirish.
 * Muhim: birinchi yurayotgan o‘yinchi stoldagi faol o‘yinchilarning qo‘lidagi karta sonidan
 * ko‘p karta tashlay olmaydi!
 */
export function validateLeadCards(
  selectedCards: Card[],
  trumpSuit: Suit,
  maxAllowedCount: number = 4
): { valid: boolean; reason?: string } {
  if (selectedCards.length === 0) {
    return { valid: false, reason: 'Kamida bitta karta tanlang!' };
  }
  if (selectedCards.length > maxAllowedCount) {
    return {
      valid: false,
      reason: `Ushbu yurishda ko‘pi bilan ${maxAllowedCount} ta karta tashlash mumkin!`,
    };
  }
  if (selectedCards.length === 1) {
    return { valid: true };
  }

  const firstSuit = selectedCards[0].suit;
  const allSameSuit = selectedCards.every((c) => c.suit === firstSuit);
  if (allSameSuit) {
    return { valid: true };
  }

  const allAces = selectedCards.every((c) => c.rank === 'A');
  const allTens = selectedCards.every((c) => c.rank === '10');
  if (selectedCards.length === 4 && (allAces || allTens)) {
    return { valid: true };
  }
  if (
    selectedCards.length === 3 &&
    allAces &&
    selectedCards.some((c) => c.suit === trumpSuit)
  ) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: 'Faqat bitta karta yoki bir xil mastdagi kartalarni tashlash mumkin!',
  };
}

/**
 * Keyingi o‘yinchi tanlagan kartalari to‘g‘ri miqdorda va o‘z qo‘lida mavjud ekanligini tekshirish.
 * Agar o‘yinchining qo‘lidagi jami kartalar soni requiredCount dan kam bo‘lsa, bor kartasini tashlaydi.
 */
export function validateFollowCards(
  selectedCards: Card[],
  requiredCount: number,
  playerHandCount: number
): { valid: boolean; reason?: string } {
  const expectedCount = Math.min(requiredCount, playerHandCount);
  if (expectedCount === 0) {
    return { valid: false, reason: 'Qo‘lingizda karta qolmagan!' };
  }
  if (selectedCards.length !== expectedCount) {
    return {
      valid: false,
      reason: `Ushbu yurishda aniq ${expectedCount} ta karta tashlashingiz kerak!`,
    };
  }
  return { valid: true };
}

/**
 * Bitta himoya/hujum kartasi (challenger) stoldagi joriy eng kuchli kartani (target)
 * ura oladimi?
 */
export function canSingleCardBeat(
  challenger: Card,
  target: Card,
  trumpSuit: Suit
): boolean {
  if (challenger.suit === target.suit) {
    return challenger.strength > target.strength;
  }
  if (challenger.suit === trumpSuit && target.suit !== trumpSuit) {
    return true;
  }
  return false;
}

/**
 * Keyingi o‘yinchining tashlagan kartalari (challengerCards) joriy eng kuchli
 * kartalar to‘plamini (currentWinningCards) to‘liq ura oladimi?
 */
export function doesPlayBeatCurrentBest(
  challengerCards: Card[],
  currentWinningCards: Card[],
  trumpSuit: Suit
): boolean {
  if (challengerCards.length !== currentWinningCards.length) return false;

  const used = new Array(challengerCards.length).fill(false);

  const sortedTargets = [...currentWinningCards].sort((a, b) => {
    const aTrump = a.suit === trumpSuit ? 100 : 0;
    const bTrump = b.suit === trumpSuit ? 100 : 0;
    return bTrump + b.strength - (aTrump + a.strength);
  });

  function matchRecursive(targetIdx: number): boolean {
    if (targetIdx === sortedTargets.length) return true;
    const target = sortedTargets[targetIdx];

    for (let i = 0; i < challengerCards.length; i++) {
      if (!used[i] && canSingleCardBeat(challengerCards[i], target, trumpSuit)) {
        used[i] = true;
        if (matchRecursive(targetIdx + 1)) return true;
        used[i] = false;
      }
    }
    return false;
  }

  return matchRecursive(0);
}

/**
 * Kartalar to‘plamidagi jami ochkolarni hisoblash
 */
export function calculateCardsPoints(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + card.points, 0);
}

/**
 * Raund yakunida o‘yinchi (yoki juftlik) olgan ochko va yutgan yurishlar soniga qarab
 * beriladigan jarima ochkosini hisoblash.
 */
export function calculatePenaltyPoints(
  roundPoints: number,
  tricksWonCount: number,
  config: BurkozelRulesConfig = DEFAULT_BURKOZEL_CONFIG
): { penalty: number; statusLabel: string } {
  if (tricksWonCount === 0) {
    return {
      penalty: config.penalties.sixPenaltyValue,
      statusLabel: 'Yurish yutilmadi (Quruq)',
    };
  }
  if (roundPoints >= config.penalties.minPointsForZeroPenalty) {
    return {
      penalty: config.penalties.zeroPenaltyValue,
      statusLabel: 'G‘olib (Jarimasiz)',
    };
  }
  if (roundPoints >= config.penalties.minPointsForTwoPenalty) {
    return {
      penalty: config.penalties.twoPenaltyValue,
      statusLabel: '31–60 ochko (2 jarima)',
    };
  }
  return {
    penalty: config.penalties.fourPenaltyValue,
    statusLabel: 'Kam ochko (4 jarima)',
  };
}

/**
 * Kolodadan kartalarni teng va adolatli (round-robin: 1 tadan aylantirib) tarqatish funksiyasi.
 * Bu 4 kishilik o‘yinda bitta o‘yinchiga boshqalardan oldin ortiqcha karta berilib ketmasligini kafolatlaydi!
 */
export function refillHandsEqually<T extends { hand: Card[] }>(
  players: T[],
  deck: Card[],
  winnerIdx: number,
  targetHandSize: number = 4
): { updatedPlayers: T[]; remainingDeck: Card[] } {
  const playerCount = players.length;
  const remainingDeck = [...deck];
  const updatedPlayers = players.map((p) => ({
    ...p,
    hand: [...p.hand],
  }));

  // Har bir o‘yinchida 4 tagacha bo‘lguncha yoki koloda tugaguncha 1 tadan karta tarqatamiz
  let cardGivenInCycle = true;
  while (remainingDeck.length > 0 && cardGivenInCycle) {
    cardGivenInCycle = false;
    for (let offset = 0; offset < playerCount; offset++) {
      if (remainingDeck.length === 0) break;
      const pIdx = (winnerIdx + offset) % playerCount;
      if (updatedPlayers[pIdx].hand.length < targetHandSize) {
        const nextCard = remainingDeck.shift()!;
        updatedPlayers[pIdx].hand.push(nextCard);
        cardGivenInCycle = true;
      }
    }
  }

  return { updatedPlayers, remainingDeck };
}

/**
 * Navbatni faqat qo‘lida kamida 1 ta karta bor o‘yinchiga o‘tkazish yordamchisi.
 * Qo‘li bo‘sh (0 ta karta) o‘yinchilarni avtomatik o‘tkazib yuboradi.
 */
export function findNextPlayerWithCards<T extends { hand: Card[] }>(
  players: T[],
  startFromIdx: number,
  alreadyPlayedIds: Set<number> = new Set()
): number | null {
  const count = players.length;
  for (let offset = 0; offset < count; offset++) {
    const idx = (startFromIdx + offset) % count;
    if (!alreadyPlayedIds.has(idx) && players[idx].hand.length > 0) {
      return idx;
    }
  }
  return null;
}

/**
 * Bot uchun aqlli yurish tanlash algoritmi (Oson, O‘rtacha, Kuchli, Usta)
 */
export function chooseBotMove(
  hand: Card[],
  isLeading: boolean,
  currentWinningCards: Card[] | null,
  currentTrickCardsAll: Card[],
  trumpSuit: Suit,
  difficulty: BotDifficulty,
  maxLeadCount: number = 4
): Card[] {
  if (hand.length === 0) return [];

  if (isLeading || !currentWinningCards || currentWinningCards.length === 0) {
    return chooseBotLeadMove(hand, trumpSuit, difficulty, maxLeadCount);
  }

  const requiredCount = Math.min(currentWinningCards.length, hand.length);
  if (requiredCount <= 0) return [];
  if (hand.length <= requiredCount) {
    return [...hand];
  }

  const combinations = getCombinations(hand, requiredCount);
  const beatingCombos = combinations.filter((combo) =>
    doesPlayBeatCurrentBest(combo, currentWinningCards, trumpSuit)
  );

  const trickPointsSoFar = calculateCardsPoints(currentTrickCardsAll);

  if (difficulty === 'oson') {
    if (beatingCombos.length > 0 && Math.random() > 0.35) {
      return beatingCombos[0];
    }
    return getLowestValueDiscard(hand, requiredCount, trumpSuit);
  }

  if (difficulty === 'ortacha') {
    if (beatingCombos.length > 0) {
      beatingCombos.sort(
        (a, b) => evaluateComboCost(a, trumpSuit) - evaluateComboCost(b, trumpSuit)
      );
      return beatingCombos[0];
    }
    return getLowestValueDiscard(hand, requiredCount, trumpSuit);
  }

  if (beatingCombos.length > 0) {
    beatingCombos.sort(
      (a, b) => evaluateComboCost(a, trumpSuit) - evaluateComboCost(b, trumpSuit)
    );
    const cheapestBeat = beatingCombos[0];
    const usesHighTrump = cheapestBeat.some(
      (c) => c.suit === trumpSuit && c.strength >= 7
    );

    if (
      difficulty === 'usta' &&
      usesHighTrump &&
      trickPointsSoFar < 10 &&
      hand.length === 4
    ) {
      const zeroPointDiscard = getLowestValueDiscard(hand, requiredCount, trumpSuit);
      if (calculateCardsPoints(zeroPointDiscard) === 0) {
        return zeroPointDiscard;
      }
    }

    return cheapestBeat;
  }

  return getLowestValueDiscard(hand, requiredCount, trumpSuit);
}

function chooseBotLeadMove(
  hand: Card[],
  trumpSuit: Suit,
  difficulty: BotDifficulty,
  maxLeadCount: number
): Card[] {
  const allowedMax = Math.min(hand.length, maxLeadCount);
  if (allowedMax <= 0) return [];

  // 1. Agar Bura bo‘lsa va barcha o‘yinchilarda 4 tadan karta bo‘lsa
  if (
    allowedMax === 4 &&
    hand.length === 4 &&
    hand.every((c) => c.suit === trumpSuit)
  ) {
    return [...hand];
  }

  // 2. Kuchli va Usta botlar: bir xil mastda Tuz + 10 bo‘lsa
  if ((difficulty === 'kuchli' || difficulty === 'usta') && allowedMax >= 2) {
    const suits: Suit[] = ['spades', 'clubs', 'diamonds', 'hearts'];
    for (const s of suits) {
      if (s === trumpSuit) continue;
      const sameSuitCards = hand
        .filter((c) => c.suit === s)
        .sort((a, b) => b.strength - a.strength);
      if (
        sameSuitCards.length >= 2 &&
        sameSuitCards[0].rank === 'A' &&
        sameSuitCards[1].rank === '10'
      ) {
        return [sameSuitCards[0], sameSuitCards[1]];
      }
    }

    const nonTrumpAce = hand.find((c) => c.suit !== trumpSuit && c.rank === 'A');
    if (nonTrumpAce) return [nonTrumpAce];
  }

  if (difficulty === 'oson') {
    return [hand[Math.floor(Math.random() * hand.length)]];
  }

  const sorted = [...hand].sort(
    (a, b) => evaluateSingleCardCost(a, trumpSuit) - evaluateSingleCardCost(b, trumpSuit)
  );
  return [sorted[0]];
}

function getLowestValueDiscard(
  hand: Card[],
  count: number,
  trumpSuit: Suit
): Card[] {
  const sorted = [...hand].sort((a, b) => {
    const aIsTrump = a.suit === trumpSuit ? 1 : 0;
    const bIsTrump = b.suit === trumpSuit ? 1 : 0;
    if (aIsTrump !== bIsTrump) return aIsTrump - bIsTrump;
    if (a.points !== b.points) return a.points - b.points;
    return a.strength - b.strength;
  });
  return sorted.slice(0, count);
}

function evaluateSingleCardCost(card: Card, trumpSuit: Suit): number {
  const trumpWeight = card.suit === trumpSuit ? 50 : 0;
  return trumpWeight + card.strength * 3 + card.points;
}

function evaluateComboCost(cards: Card[], trumpSuit: Suit): number {
  return cards.reduce((acc, c) => acc + evaluateSingleCardCost(c, trumpSuit), 0);
}

function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const head = arr[0];
  const tail = arr.slice(1);
  const withHead = getCombinations(tail, k - 1).map((c) => [head, ...c]);
  const withoutHead = getCombinations(tail, k);
  return [...withHead, ...withoutHead];
}
