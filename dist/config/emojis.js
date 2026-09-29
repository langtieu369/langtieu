"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMOJIS = void 0;
exports.emojiText = emojiText;
exports.emojiComponent = emojiComponent;
exports.emojiFromLegacy = emojiFromLegacy;
exports.renderEmojis = renderEmojis;
exports.auditEmojiRegistry = auditEmojiRegistry;
exports.EMOJIS = {
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
};
function emojiText(key) {
    const value = exports.EMOJIS[key];
    if (value.id && value.name)
        return `<${value.animated ? 'a' : ''}:${value.name}:${value.id}>`;
    return value.fallback;
}
/** Discord button/select emoji. Placeholder của select vẫn phải là plain text. */
function emojiComponent(key) {
    const value = exports.EMOJIS[key];
    return value.id && value.name
        ? { id: value.id, name: value.name, animated: value.animated }
        : value.fallback;
}
const LEGACY_TO_KEY = new Map(Object.entries(exports.EMOJIS).map(([key, value]) => [value.fallback, key]));
/** Giữ catalog cũ tương thích nhưng kết quả vẫn chịu điều khiển bởi file này. */
function emojiFromLegacy(fallback) {
    const key = LEGACY_TO_KEY.get(fallback);
    return key ? emojiText(key) : fallback;
}
/** Thay mọi fallback xuất hiện trong đoạn text bằng cấu hình hiện tại. */
function renderEmojis(input) {
    let output = input;
    const definitions = Object.entries(exports.EMOJIS)
        .sort((a, b) => b[1].fallback.length - a[1].fallback.length);
    for (const [key, value] of definitions)
        output = output.split(value.fallback).join(emojiText(key));
    return output;
}
function auditEmojiRegistry() {
    const errors = [];
    for (const [key, raw] of Object.entries(exports.EMOJIS)) {
        const value = raw;
        if (!value.fallback)
            errors.push(`${key}: thiếu fallback`);
        if (!!value.id !== !!value.name)
            errors.push(`${key}: custom emoji phải có đủ id và name`);
        if (value.id && !/^\d{16,22}$/.test(value.id))
            errors.push(`${key}: Discord emoji id không hợp lệ`);
    }
    return errors;
}
