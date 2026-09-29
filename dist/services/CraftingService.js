"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.craftingService = exports.PROFESSION_NAMES = void 0;
const GameCatalog_1 = require("../config/GameCatalog");
const UserRepository_1 = require("../database/repositories/UserRepository");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const database_1 = __importDefault(require("../database/database"));
const DutyService_1 = require("./DutyService");
const RareFireService_1 = require("./RareFireService");
const RareFireResolver_1 = require("./RareFireResolver");
const StorageService_1 = require("./StorageService");
const ItemInstanceService_1 = require("./ItemInstanceService");
const RuntimeSystemsService_1 = require("./RuntimeSystemsService");
const level = (exp) => exp >= 120 ? 6 : exp >= 60 ? 5 : exp >= 25 ? 4 : exp >= 10 ? 3 : exp >= 3 ? 2 : 1;
exports.PROFESSION_NAMES = ['', 'Học Đồ', 'Nhập Môn', 'Tinh Thục', 'Đại Thành', 'Tông Sư', 'Đạo Sư'];
exports.craftingService = {
    mastery(uid, kind) { return database_1.default.prepare('SELECT * FROM craft_mastery WHERE user_id=? AND kind=?').get(uid, kind) || { exp: 0, level: 1 }; },
    chance(uid, rid) { const r = GameCatalog_1.RECIPES.find(x => x.id === rid), u = UserRepository_1.userRepository.get(uid); if (!r || !u)
        return 0; const m = this.mastery(uid, r.kind); return Math.min(.98, .68 + m.level * .05 + Math.max(0, (0, GameCatalog_1.realmOf)(u.level).rank - r.minRealm) * .02); },
    craft(uid, rid, fireId, roll = Math.random()) {
        const u = UserRepository_1.userRepository.get(uid), r = GameCatalog_1.RECIPES.find(x => x.id === rid);
        if (!u)
            return { ok: false, message: 'Đạo hữu chưa lập đạo hồ.' };
        if (!r)
            return { ok: false, message: 'Không tìm thấy bí phương.' };
        if (r.id.startsWith('storage_bag_'))
            return StorageService_1.storageService.craft(uid, r.id);
        const m = this.mastery(uid, r.kind), required = Math.min(6, r.minRealm + 1);
        if (m.level < required)
            return { ok: false, message: `Bí phương yêu cầu ${exports.PROFESSION_NAMES[required]} cấp ${required}; hiện tại ${exports.PROFESSION_NAMES[m.level]} cấp ${m.level}.` };
        if ((0, GameCatalog_1.realmOf)(u.level).rank < r.minRealm)
            return { ok: false, message: 'Cảnh giới chưa đủ.' };
        if (u.coin_ha_pham < r.lt)
            return { ok: false, message: 'Linh Thạch không đủ.' };
        for (const [x, q] of r.ingredients)
            if (InventoryRepository_1.inventoryRepository.quantity(uid, x) < q)
                return { ok: false, message: `Thiếu ${(0, GameCatalog_1.itemName)(x)} (${InventoryRepository_1.inventoryRepository.quantity(uid, x)}/${q}).` };
        let mastery = 'so_dan';
        if (fireId) {
            if (!r.fire)
                return { ok: false, message: 'Bí phương không hỗ trợ Dị Hỏa.' };
            const o = RareFireService_1.rareFireService.get(uid, fireId);
            if (!o || !o.placed_at)
                return { ok: false, message: 'Dị Hỏa chưa được sở hữu/an trí.' };
            mastery = o.mastery;
        }
        const fire = (0, RareFireResolver_1.resolveRareFire)(fireId, r.fire, mastery);
        if (!fire.allowed)
            return { ok: false, message: `Chủ Hỏa không tương thích: ${fire.reason}` };
        const chance = this.chance(uid, rid), success = roll < chance, out = GameCatalog_1.ITEMS[r.output[0]], baseScore = Math.min(89, 60 + Math.max(0, (0, GameCatalog_1.realmOf)(u.level).rank - r.minRealm) * 3), quality = (0, RareFireResolver_1.applyFireQuality)(baseScore, fire);
        let overflow = false, spirit = '';
        database_1.default.transaction(() => { for (const [x, q] of r.ingredients)
            InventoryRepository_1.inventoryRepository.remove(uid, x, q); database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham-? WHERE discord_id=?').run(r.lt, uid); database_1.default.prepare('INSERT INTO craft_mastery(user_id,kind,exp,level) VALUES(?,?,1,1) ON CONFLICT(user_id,kind) DO UPDATE SET exp=exp+1').run(uid, r.kind); const e = database_1.default.prepare('SELECT exp FROM craft_mastery WHERE user_id=? AND kind=?').get(uid, r.kind).exp; database_1.default.prepare('UPDATE craft_mastery SET level=? WHERE user_id=? AND kind=?').run(level(e), uid, r.kind); if (!success)
            return; const t = Date.now(), p = database_1.default.prepare('INSERT INTO rare_fire_process_log(user_id,recipe_id,fire_id,compatibility,base_score,final_score,quality_band,created_at) VALUES(?,?,?,?,?,?,?,?)').run(uid, r.id, fireId || null, fire.compatibility, baseScore, quality.score, quality.band, Math.floor(t / 1000)), pid = Number(p.lastInsertRowid); if (['weapon', 'armor'].includes(out.type)) {
            const x = ItemInstanceService_1.itemInstanceService.create(uid, r.output[0], out.type, { source: 'CRAFT', recipeId: r.id, processId: pid, fireId: fireId || null }, { quality: out.rarity, binding: 'UNBOUND' });
            overflow = x.location === 'TEMPORARY';
            if (out.type === 'weapon') {
                const c = Math.min(.35, .02 + r.minRealm * .025 + (fireId ? .04 : 0)), q = RuntimeSystemsService_1.qilingRuntime.seed(uid, x.instance_id, c);
                if (q.message.includes('đã sinh'))
                    spirit = ' Vật Mang đã sinh Linh Cơ.';
            }
        }
        else
            overflow = InventoryRepository_1.inventoryRepository.add(uid, r.output[0], r.output[1]).overflow > 0; database_1.default.prepare('INSERT INTO crafted_outputs(process_id,user_id,item_id,quantity,quality_band,fire_id,created_at) VALUES(?,?,?,?,?,?,?)').run(pid, uid, r.output[0], r.output[1], quality.band, fireId || null, Math.floor(t / 1000)); })();
        DutyService_1.dutyService.inc(uid, 'craft');
        return success ? { ok: true, message: `${(0, GameCatalog_1.itemEmoji)(r.output[0])} Thu được ${(0, GameCatalog_1.itemName)(r.output[0])} ×${r.output[1]}.${overflow ? ' Thành phẩm vào Tạm Nang.' : ''}${spirit}` } : { ok: true, message: `Chế tác thất bại (${Math.round(chance * 100)}%); nguyên liệu đã tiêu hao, nghề vẫn nhận EXP.` };
    },
    craftMany(uid, rid, count) { if (![1, 5, 10].includes(count))
        return { ok: false, message: 'Chỉ hỗ trợ ×1, ×5 hoặc ×10.' }; const r = GameCatalog_1.RECIPES.find(x => x.id === rid), u = UserRepository_1.userRepository.get(uid); if (!r || !u)
        return { ok: false, message: 'Không tìm thấy bí phương.' }; if (u.coin_ha_pham < r.lt * count)
        return { ok: false, message: `Thiếu LT cho ${count} lượt.` }; for (const [x, q] of r.ingredients)
        if (InventoryRepository_1.inventoryRepository.quantity(uid, x) < q * count)
            return { ok: false, message: `Thiếu ${(0, GameCatalog_1.itemName)(x)}: ${InventoryRepository_1.inventoryRepository.quantity(uid, x)}/${q * count}.` }; let success = 0, fail = 0; for (let i = 0; i < count; i++) {
        const z = this.craft(uid, rid);
        z.message.includes('thất bại') ? fail++ : success++;
    } return { ok: true, message: `Hoàn tất ${count} lượt: ${success} thành / ${fail} bại.` }; }
};
