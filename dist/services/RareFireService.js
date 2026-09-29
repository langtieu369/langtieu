"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rareFireService = exports.RareFireService = void 0;
const database_1 = __importDefault(require("../database/database"));
const RareFireCatalog_1 = require("../config/RareFireCatalog");
class RareFireService {
    owns(uid, fireId) { return !!database_1.default.prepare('SELECT 1 FROM rare_fire_ownership WHERE user_id=? AND fire_id=?').get(uid, fireId); }
    get(uid, fireId) { return database_1.default.prepare('SELECT * FROM rare_fire_ownership WHERE user_id=? AND fire_id=?').get(uid, fireId) ?? null; }
    list(uid) { return database_1.default.prepare('SELECT * FROM rare_fire_ownership WHERE user_id=? ORDER BY acquired_at').all(uid); }
    acquire(uid, fireId, provenance, at = Math.floor(Date.now() / 1000)) {
        if (!RareFireCatalog_1.RARE_FIRE_BY_ID[fireId])
            return { ok: false, message: 'Dị Hỏa không tồn tại trong Hỏa Phổ.' };
        if (!provenance.trim())
            return { ok: false, message: 'Dị Hỏa bắt buộc có provenance.' };
        const result = database_1.default.prepare(`INSERT OR IGNORE INTO rare_fire_ownership(user_id,fire_id,mastery,provenance,acquired_at) VALUES(?,?,'so_dan',?,?)`).run(uid, fireId, provenance.trim(), at);
        return result.changes ? { ok: true, message: `Đã ghi nhận ${RareFireCatalog_1.RARE_FIRE_BY_ID[fireId].name} vào Hỏa Phổ.` } : { ok: false, message: 'Người chơi đã sở hữu Dị Hỏa này; không tạo bản trùng.' };
    }
    place(uid, fireId, placementId) {
        if (!this.owns(uid, fireId))
            return { ok: false, message: 'Người chơi chưa sở hữu Dị Hỏa này.' };
        if (!placementId.trim())
            return { ok: false, message: 'Hỏa Vị không hợp lệ.' };
        database_1.default.prepare('UPDATE rare_fire_ownership SET placed_at=? WHERE user_id=? AND fire_id=?').run(placementId.trim(), uid, fireId);
        return { ok: true, message: 'Đã an trí Dị Hỏa tại Hỏa Vị.' };
    }
    unplace(uid, fireId) { database_1.default.prepare('UPDATE rare_fire_ownership SET placed_at=NULL WHERE user_id=? AND fire_id=?').run(uid, fireId); }
    canUse(uid, fireId) { const row = this.get(uid, fireId); return !!row?.placed_at; }
    setMastery(uid, fireId, mastery) {
        if (!this.owns(uid, fireId))
            return false;
        database_1.default.prepare('UPDATE rare_fire_ownership SET mastery=? WHERE user_id=? AND fire_id=?').run(mastery, uid, fireId);
        return true;
    }
}
exports.RareFireService = RareFireService;
exports.rareFireService = new RareFireService();
