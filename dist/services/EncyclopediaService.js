"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encyclopediaService = void 0;
exports.sourceText = sourceText;
const GameCatalog_1 = require("../config/GameCatalog");
function sourceText(s) { return `• **${s.location}** — ${s.detail}${s.minRealm ? ` · Yêu cầu ${GameCatalog_1.REALMS[s.minRealm].name}` : ''}`; }
exports.encyclopediaService = { categories() { return [...new Set(Object.values(GameCatalog_1.ITEMS).map(i => i.type))]; }, items(type) { return Object.values(GameCatalog_1.ITEMS).filter(i => !type || i.type === type).sort((a, b) => a.value - b.value); }, entry(id) { const i = GameCatalog_1.ITEMS[id]; if (!i)
        return null; const recipe = (0, GameCatalog_1.recipeFor)(id); return { item: i, text: `${i.emoji} **${i.name}** · ${(0, GameCatalog_1.rarityName)(i.rarity)} phẩm\n${i.description}\n\n**Nguồn thu được**\n${i.sources.map(sourceText).join('\n')}\n\n**Công dụng**\n${i.uses.map(x => `• ${x}`).join('\n')}${recipe ? `\n\n**Phương thức chế tác**\n${recipe.ingredients.map(([x, q]) => `• ${GameCatalog_1.ITEMS[x].name} ×${q}`).join('\n')}\n• Hao phí ${recipe.lt} LT` : ''}\n\n**Giao dịch:** ${i.tradable ? 'Có thể đưa lên Kim Vân Đài' : 'Không thể giao dịch'}` }; } };
