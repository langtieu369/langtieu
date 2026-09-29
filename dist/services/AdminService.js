"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const database_1 = __importDefault(require("../database/database"));
const permissions_1 = require("../config/permissions");
const UserRepository_1 = require("../database/repositories/UserRepository");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const GameCatalog_1 = require("../config/GameCatalog");
function audit(ownerId, action, targetId, detail) {
    database_1.default.prepare('INSERT INTO admin_audit(owner_id,action,target_id,detail,created_at) VALUES(?,?,?,?,?)')
        .run(ownerId, action, targetId, detail, Math.floor(Date.now() / 1000));
}
exports.adminService = {
    adjustCurrency(ownerId, targetId, currency, amount) { (0, permissions_1.assertBotOwner)(ownerId); const u = UserRepository_1.userRepository.get(targetId); if (!u)
        return { ok: false, message: 'Không tìm thấy đạo hồ mục tiêu.' }; const col = currency === 'lt' ? 'coin_ha_pham' : 'knb'; const now = Number(u[col] || 0), next = Math.max(0, now + Math.trunc(amount)); UserRepository_1.userRepository.update(targetId, { [col]: next }); audit(ownerId, 'ADJUST_CURRENCY', targetId, JSON.stringify({ currency, amount, before: now, after: next })); return { ok: true, message: `✅ ${currency === 'lt' ? 'Linh Thạch' : 'CPLT'}: **${now.toLocaleString()} → ${next.toLocaleString()}**.` }; },
    setCurrency(ownerId, targetId, currency, value) { (0, permissions_1.assertBotOwner)(ownerId); const u = UserRepository_1.userRepository.get(targetId); if (!u)
        return { ok: false, message: 'Không tìm thấy đạo hồ mục tiêu.' }; const col = currency === 'lt' ? 'coin_ha_pham' : 'knb'; const now = Number(u[col] || 0), next = Math.max(0, Math.trunc(value)); UserRepository_1.userRepository.update(targetId, { [col]: next }); audit(ownerId, 'SET_CURRENCY', targetId, JSON.stringify({ currency, before: now, after: next })); return { ok: true, message: `✅ Đã đặt ${currency === 'lt' ? 'Linh Thạch' : 'CPLT'} thành **${next.toLocaleString()}**.` }; },
    adjustItem(ownerId, targetId, itemId, amount) { (0, permissions_1.assertBotOwner)(ownerId); const item = GameCatalog_1.ITEMS[itemId]; if (!item)
        return { ok: false, message: `Không có vật phẩm mã **${itemId}** trong GameCatalog.` }; const q = Math.trunc(amount); if (q === 0)
        return { ok: false, message: 'Số lượng thay đổi không thể bằng 0.' }; if (q > 0)
        InventoryRepository_1.inventoryRepository.add(targetId, itemId, q);
    else {
        const have = InventoryRepository_1.inventoryRepository.quantity(targetId, itemId);
        const remove = Math.min(have, Math.abs(q));
        if (remove > 0)
            InventoryRepository_1.inventoryRepository.remove(targetId, itemId, remove);
    } audit(ownerId, 'ADJUST_ITEM', targetId, JSON.stringify({ itemId, amount: q })); return { ok: true, message: `✅ ${item.emoji} **${item.name}** ${q > 0 ? '+' : ''}${q}.` }; },
    auditRecent(ownerId, limit = 10) { (0, permissions_1.assertBotOwner)(ownerId); return database_1.default.prepare('SELECT * FROM admin_audit ORDER BY id DESC LIMIT ?').all(Math.max(1, Math.min(25, limit))); }
};
