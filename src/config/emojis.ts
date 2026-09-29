/**
 * Nguồn duy nhất của toàn bộ emoji hiển thị trong bot.
 *
 * Muốn đổi emoji Unicode: sửa `fallback` tại đây.
 * Muốn dùng custom emoji Discord: điền `id` và `name`; mọi button/select/text
 * gọi resolver bên dưới sẽ tự dùng custom emoji, không phải sửa handler.
 */
export interface EmojiDefinition {
  fallback: string;
  name?: string;
  id?: string;
  animated?: boolean;
}

export const EMOJIS = {
  currency_lt: { fallback: '💠' },
  currency_cplt: { fallback: '🔷' },
  home: { fallback: '🏠' },
  profile: { fallback: '👤' },
  world: { fallback: '🌄' },
  duty: { fallback: '📜' },
  shop: { fallback: '🏮' },
  knowledge: { fallback: '📖' },
  combat: { fallback: '⚔️' },
  inventory: { fallback: '🎒' },
  craft: { fallback: '⚒️' },
  cultivation: { fallback: '🧘' },
  rarity_pham: { fallback: '⚪' },
  rarity_linh: { fallback: '🟢' },
  rarity_huyen: { fallback: '🔵' },
  rarity_dia: { fallback: '🟣' },
  rarity_thien: { fallback: '🟡' },
  rarity_tien: { fallback: '✨' },
  material_ore: { fallback: '⛏️' },
  material_herb: { fallback: '🌿' },
  material_jade: { fallback: '💎' },
  fish: { fallback: '🐟' },
  dragon: { fallback: '🐉' },
  beast: { fallback: '🔮' },
  boss: { fallback: '🐲' },
  weapon: { fallback: '⚔️' },
  heirloom_weapon: { fallback: '🗡️' },
  armor: { fallback: '🛡️' },
  pill: { fallback: '💊' },
  food: { fallback: '🍲' },
  map: { fallback: '🗺️' },
  fire: { fallback: '🔥' },
  seed: { fallback: '🌱' },
  leaf: { fallback: '🍂' },
  thread: { fallback: '🧵' },
  special: { fallback: '📦' },
  wing: { fallback: '🪽' },
  dark_star: { fallback: '🌑' },
  cloud: { fallback: '☁️' },
  archaeology: { fallback: '🏺' },
  mount: { fallback: '🐎' },
  locked: { fallback: '🔒' },
  unlocked: { fallback: '🔓' },
  success: { fallback: '✅' },
  failure: { fallback: '❌' },
  back: { fallback: '◀️' },
  next: { fallback: '▶️' },
  add: { fallback: '➕' },
  refresh: { fallback: '🔄' },
  return: { fallback: '↩️' },
  cart: { fallback: '🛒' },
  auction: { fallback: '🔨' },
  talk: { fallback: '💬' },
  sect: { fallback: '🏯' },
  exit: { fallback: '🚪' },
  party: { fallback: '👥' },
  leader: { fallback: '👑' },
  dao: { fallback: '☯️' },
} as const satisfies Record<string, EmojiDefinition>;

export type EmojiKey = keyof typeof EMOJIS;

export function emojiText(key: EmojiKey): string {
  const value: EmojiDefinition = EMOJIS[key];
  if (value.id && value.name) return `<${value.animated ? 'a' : ''}:${value.name}:${value.id}>`;
  return value.fallback;
}

/** Discord button/select emoji. Placeholder của select vẫn phải là plain text. */
export function emojiComponent(key: EmojiKey): string | { id: string; name: string; animated?: boolean } {
  const value: EmojiDefinition = EMOJIS[key];
  return value.id && value.name
    ? { id: value.id, name: value.name, animated: value.animated }
    : value.fallback;
}

const LEGACY_TO_KEY = new Map<string, EmojiKey>(
  (Object.entries(EMOJIS) as [EmojiKey, EmojiDefinition][]).map(([key, value]) => [value.fallback, key]),
);

/** Giữ catalog cũ tương thích nhưng kết quả vẫn chịu điều khiển bởi file này. */
export function emojiFromLegacy(fallback: string): string {
  const key = LEGACY_TO_KEY.get(fallback);
  return key ? emojiText(key) : fallback;
}

/** Thay mọi fallback xuất hiện trong đoạn text bằng cấu hình hiện tại. */
export function renderEmojis(input: string): string {
  let output = input;
  const definitions = (Object.entries(EMOJIS) as [EmojiKey, EmojiDefinition][])
    .sort((a, b) => b[1].fallback.length - a[1].fallback.length);
  for (const [key, value] of definitions) output = output.split(value.fallback).join(emojiText(key));
  return output;
}

export function auditEmojiRegistry(): string[] {
  const errors: string[] = [];
  for (const [key, raw] of Object.entries(EMOJIS)) {
    const value: EmojiDefinition = raw;
    if (!value.fallback) errors.push(`${key}: thiếu fallback`);
    if (!!value.id !== !!value.name) errors.push(`${key}: custom emoji phải có đủ id và name`);
    if (value.id && !/^\d{16,22}$/.test(value.id)) errors.push(`${key}: Discord emoji id không hợp lệ`);
  }
  return errors;
}
