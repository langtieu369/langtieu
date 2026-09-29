"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const database_1 = __importDefault(require("../database/database"));
const GameCatalog_1 = require("../config/GameCatalog");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const UserRepository_1 = require("../database/repositories/UserRepository");
const now = () => Date.now();
const masteryLevel = (exp) => exp >= 60 ? 5 : exp >= 25 ? 4 : exp >= 10 ? 3 : exp >= 3 ? 2 : 1;
exports.storageService = {
    active(uid) { return InventoryRepository_1.inventoryRepository.ensureStorage(uid); },
    bags(uid) { InventoryRepository_1.inventoryRepository.ensureStorage(uid); return database_1.default.prepare('SELECT * FROM storage_bags WHERE user_id=? ORDER BY equipped DESC,tier DESC,id').all(uid); },
    mastery(uid) { database_1.default.prepare("INSERT OR IGNORE INTO craft_mastery(user_id,kind,exp,level) VALUES(?,'forging',0,1)").run(uid); return database_1.default.prepare("SELECT exp,level FROM craft_mastery WHERE user_id=? AND kind='forging'").get(uid); },
    addMastery(uid, exp) { const m = this.mastery(uid), next = m.exp + exp; database_1.default.prepare("UPDATE craft_mastery SET exp=?,level=? WHERE user_id=? AND kind='forging'").run(next, masteryLevel(next), uid); },
    knows(uid, recipeId) { return !!database_1.default.prepare('SELECT 1 FROM recipe_knowledge WHERE user_id=? AND recipe_id=?').get(uid, recipeId); },
    learn(uid, recipeId) { const u = UserRepository_1.userRepository.get(uid), m = this.mastery(uid); if (!u)
        return { ok: false, message: 'Chưa có đạo hồ.' }; if (this.knows(uid, recipeId))
        return { ok: true, message: 'Thiên bí phương này đã được ghi trong thức hải.' }; let source = '', lt = 0, cplt = 0, token = 0; if (recipeId === 'storage_bag_1')
        source = 'Tử Hà Các · Khí Dụng Nhập Môn';
    else if (recipeId === 'storage_bag_2') {
        if (u.level < 20 || m.level < 2)
            return { ok: false, message: 'Cần Trúc Cơ và Khí Luyện Thành Thục (cấp 2).' };
        source = 'Nhất Phẩm Các · Bí Phương Tầng Hai';
        lt = 3000;
    }
    else if (recipeId === 'storage_bag_3') {
        if (m.level < 2)
            return { ok: false, message: 'Khí Luyện chưa đạt Thành Thục.' };
        source = 'Trấn Hải Các · Công Huân Khố';
        token = 12;
    }
    else if (recipeId === 'storage_bag_4') {
        const clears = database_1.default.prepare("SELECT COALESCE(SUM(clears),0) n FROM secret_realm_log WHERE user_id=? AND CAST(REPLACE(realm_id,'realm_','') AS INTEGER)>=4").get(uid).n;
        if (clears < 3)
            return { ok: false, message: 'Cần hoàn thành ít nhất ba lần Bí Cảnh từ Hóa Thần trở lên.' };
        source = 'Bí Cảnh Không Gian · Tàn Quyển Diễn Không';
        cplt = 10;
    }
    else if (recipeId === 'storage_bag_5') {
        const bosses = database_1.default.prepare('SELECT COUNT(DISTINCT boss_id) n FROM boss_damage WHERE user_id=? AND damage>0').get(uid).n;
        if (bosses < 3 || m.level < 4)
            return { ok: false, message: 'Cần chiến tích với ba Cường Địch và Khí Luyện Đại Thành (cấp 4).' };
        source = 'Xích Dực Các · Thiên Công Mật Quyển';
        cplt = 40;
    }
    else
        return { ok: false, message: 'Không tồn tại thiên bí phương này.' }; if (lt && u.coin_ha_pham < lt)
        return { ok: false, message: `Cần ${lt.toLocaleString()} LT.` }; if (cplt && u.knb < cplt)
        return { ok: false, message: `Cần ${cplt} CPLT.` }; if (token && InventoryRepository_1.inventoryRepository.quantity(uid, 'tranhai_lenh') < token)
        return { ok: false, message: `Cần ${token} Trấn Hải Công Lệnh.` }; database_1.default.transaction(() => { if (lt)
        database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham-? WHERE discord_id=?').run(lt, uid); if (cplt)
        database_1.default.prepare('UPDATE users SET knb=knb-? WHERE discord_id=?').run(cplt, uid); if (token)
        InventoryRepository_1.inventoryRepository.remove(uid, 'tranhai_lenh', token); database_1.default.prepare('INSERT INTO recipe_knowledge(user_id,recipe_id,source,unlocked_at) VALUES(?,?,?,?)').run(uid, recipeId, source, now()); })(); return { ok: true, message: `Đã lĩnh hội **${GameCatalog_1.RECIPES.find(r => r.id === recipeId).name}** từ ${source}.` }; },
    switchBag(uid, bagId) { const bag = database_1.default.prepare('SELECT * FROM storage_bags WHERE id=? AND user_id=?').get(bagId, uid); if (!bag)
        return { ok: false, message: 'Không tìm thấy Túi Càn Khôn này.' }; if (bag.equipped)
        return { ok: true, message: 'Túi này đang được trang bị.' }; const used = InventoryRepository_1.inventoryRepository.usedSlots(uid); if (used > bag.capacity)
        return { ok: false, message: `Không thể đổi túi: đang dùng ${used} ô nhưng túi này chỉ có ${bag.capacity} ô.` }; database_1.default.transaction(() => { database_1.default.prepare('UPDATE storage_bags SET equipped=0 WHERE user_id=?').run(uid); database_1.default.prepare('UPDATE storage_bags SET equipped=1 WHERE id=? AND user_id=?').run(bagId, uid); })(); return { ok: true, message: `Đã trang bị **${GameCatalog_1.ITEMS[bag.item_id].name}** (${used}/${bag.capacity} ô).` }; },
    craft(uid, recipeId, forcedRoll) { const recipe = GameCatalog_1.RECIPES.find(r => r.id === recipeId && r.id.startsWith('storage_bag_')), u = UserRepository_1.userRepository.get(uid); if (!recipe || !u)
        return { ok: false, message: 'Không tìm thấy thiên Càn Khôn Nang Chế Pháp này.' }; if (!this.knows(uid, recipeId))
        return { ok: false, message: 'Chưa lĩnh hội thiên bí phương này.' }; const target = GameCatalog_1.STORAGE_TIERS.find(x => x.itemId === recipe.output[0]); if ((0, GameCatalog_1.realmOf)(u.level).rank < recipe.minRealm)
        return { ok: false, message: 'Cảnh giới hiện tại chưa đủ để ổn định không gian trong nang.' }; if (u.coin_ha_pham < recipe.lt)
        return { ok: false, message: `Cần ${recipe.lt.toLocaleString()} LT để khai luyện.` }; let phoi = null; const prior = GameCatalog_1.STORAGE_TIERS.find(x => x.tier === target.tier - 1); if (target.tier > 1) {
        phoi = database_1.default.prepare('SELECT * FROM storage_bags WHERE user_id=? AND item_id=? AND equipped=0 ORDER BY id LIMIT 1').get(uid, prior.itemId);
        if (!phoi)
            return { ok: false, message: `Cần một **${prior.name}** rỗng và không trang bị làm Khí Phôi.` };
    } for (const [item, q] of recipe.ingredients) {
        if (item.startsWith('bag_'))
            continue;
        if (InventoryRepository_1.inventoryRepository.quantity(uid, item) < q)
            return { ok: false, message: `Thiếu **${GameCatalog_1.ITEMS[item].name}** (${InventoryRepository_1.inventoryRepository.quantity(uid, item)}/${q}).` };
    } const m = this.mastery(uid), bonus = Math.max(0, (0, GameCatalog_1.realmOf)(u.level).rank - recipe.minRealm) * .03 + (m.level - 1) * .02, chance = Math.min(.95, target.success + bonus), roll = forcedRoll ?? Math.random(), success = roll < chance; database_1.default.transaction(() => { for (const [item, q] of recipe.ingredients)
        if (!item.startsWith('bag_'))
            InventoryRepository_1.inventoryRepository.remove(uid, item, q); database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham-? WHERE discord_id=?').run(recipe.lt, uid); if (phoi)
        database_1.default.prepare('DELETE FROM storage_bags WHERE id=? AND user_id=? AND equipped=0').run(phoi.id, uid); if (success)
        database_1.default.prepare('INSERT INTO storage_bags(user_id,item_id,tier,capacity,equipped,created_at) VALUES(?,?,?,?,0,?)').run(uid, target.itemId, target.tier, target.capacity, now()); database_1.default.prepare('INSERT INTO storage_craft_log(user_id,recipe_id,consumed_bag_id,outcome,roll,chance,created_at) VALUES(?,?,?,?,?,?,?)').run(uid, recipe.id, phoi?.id || null, success ? 'SUCCESS' : 'FAIL', roll, chance, now()); this.addMastery(uid, success ? 2 : 1); })(); return success ? { ok: true, message: `🎒 Chế thành **${target.name}** · ${target.capacity} ô. Túi mới chưa trang bị.` } : { ok: false, message: `Khí cơ tan trước khi không gian thành hình. Linh tài${phoi ? ' và Khí Phôi' : ''} đã tiêu hao; túi đang trang bị cùng vật phẩm bên trong không bị ảnh hưởng.` }; },
    audit() { const errors = []; for (const t of GameCatalog_1.STORAGE_TIERS.slice(1)) {
        const r = GameCatalog_1.RECIPES.find(x => x.output[0] === t.itemId);
        if (!r)
            errors.push(`${t.itemId}: thiếu recipe`);
        if (t.tier > 1 && !r?.ingredients.some(([x]) => x === GameCatalog_1.STORAGE_TIERS[t.tier - 1].itemId))
            errors.push(`${t.itemId}: sai phôi liền trước`);
    } return errors; }
};
