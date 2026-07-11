const ADJECTIVES = [
  "기도하는",
  "감사하는",
  "사랑받는",
  "동행하는",
  "예배하는",
  "은혜로운",
  "축복받은",
  "순종하는",
  "기뻐하는",
  "소망하는",
  "지혜로운",
  "온유한",
  "기대하는",
  "헌신하는",
  "찬양하는",
];

const NOUNS = [
  "예배자",
  "순례자",
  "제자",
  "청지기",
  "동역자",
  "어린양",
  "자녀",
  "증인",
  "편지",
  "향기",
  "밀알",
  "질그릇",
  "중보자",
  "발걸음",
  "기록자",
];

export function generateRandomNickname(): string {
  const randomAdjective =
    ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

  return `${randomAdjective} ${randomNoun}`;
}
