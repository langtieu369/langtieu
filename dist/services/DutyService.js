"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dutyService = void 0;
const database_1 = __importDefault(require("../database/database"));
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
function day() { return new Date().toISOString().slice(0, 10); }
exports.dutyService = { row(uid) { database_1.default.prepare('INSERT OR IGNORE INTO duty_progress(user_id,day) VALUES(?,?)').run(uid, day()); return database_1.default.prepare('SELECT * FROM duty_progress WHERE user_id=? AND day=?').get(uid, day()); }, inc(uid, k) { const c = k + '_count'; this.row(uid); database_1.default.prepare(`UPDATE duty_progress SET ${c}=${c}+1 WHERE user_id=? AND day=?`).run(uid, day()); }, claim(uid) { const r = this.row(uid); if (r.claimed)
        return { ok: false, message: 'Công thưởng hôm nay đã lĩnh.' }; if (r.work_count < 4 || r.fish_count < 2 || r.craft_count < 1 || r.combat_count < 1)
        return { ok: false, message: 'Bốn hạng nghĩa vụ hôm nay vẫn chưa viên mãn.' }; database_1.default.transaction(() => { database_1.default.prepare('UPDATE duty_progress SET claimed=1 WHERE user_id=? AND day=?').run(uid, day()); database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham+800,knb=knb+2 WHERE discord_id=?').run(uid); InventoryRepository_1.inventoryRepository.add(uid, 'tranhai_lenh', 1); })(); return { ok: true, message: '📜 Trấn Hải Các ghi nhận công lao: **800 LT + 2 CPLT + 1 Trấn Hải Công Lệnh**.' }; } };
