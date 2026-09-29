"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumableService = void 0;
const GameCatalog_1 = require("../config/GameCatalog");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const EffectService_1 = require("./EffectService");
const CultivationService_1 = require("./CultivationService");
const UserRepository_1 = require("../database/repositories/UserRepository");
exports.consumableService = { use(uid, itemId) { const i = GameCatalog_1.ITEMS[itemId]; if (!i || !['pill', 'food'].includes(i.type))
        return { ok: false, message: 'Vật phẩm này không thể trực tiếp sử dụng.' }; if (InventoryRepository_1.inventoryRepository.quantity(uid, itemId) < 1)
        return { ok: false, message: 'Túi Càn Khôn không có vật phẩm này.' }; InventoryRepository_1.inventoryRepository.remove(uid, itemId, 1); const tier = Number(itemId.split('_').pop()) || 0; if (i.type === 'food') {
        const pct = .05 + tier * .015;
        const effect = tier % 3 === 0 ? { atkPct: pct, defPct: pct / 2 } : tier % 3 === 1 ? { defPct: pct, hpPct: pct } : { atkPct: pct, speedPct: pct / 2 };
        EffectService_1.effectService.apply(uid, itemId, effect, 30 + tier * 5);
        return { ok: true, message: `🍲 Đã dùng **${i.name}**. Gia trì có hiệu lực trong **${30 + tier * 5} phút**.` };
    } const u = UserRepository_1.userRepository.get(uid); const rank = (0, GameCatalog_1.realmOf)(u.level).rank; const gain = 100 + tier * 180 + rank * 25; const g = CultivationService_1.cultivationService.addTuVi(uid, gain); return { ok: true, message: `💊 Đã dùng **${(0, GameCatalog_1.itemName)(itemId)}**, nhận **${gain} Tu Vi**.${g.message ? `\n${g.message}` : ''}` }; } };
