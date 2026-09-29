"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appearanceService = exports.DEFAULT_PROFILE_THUMBNAIL = void 0;
const database_1 = __importDefault(require("../database/database"));
exports.DEFAULT_PROFILE_THUMBNAIL = 'https://cdn.discordapp.com/attachments/1554068055989026826/1554068450614448178/tb.jfif';
function imageUrl(value) { try {
    const u = new URL(value.trim());
    return ['http:', 'https:'].includes(u.protocol) && u.toString().length <= 2000 ? u.toString() : '';
}
catch {
    return '';
} }
exports.appearanceService = {
    update(uid, field, raw) { const value = imageUrl(raw); if (!value)
        return { ok: false, message: 'Link ảnh không hợp lệ; cần dùng `http://` hoặc `https://`.' }; const user = database_1.default.prepare('SELECT avatar_url,thumbnail_url FROM users WHERE discord_id=?').get(uid); if (!user)
        return { ok: false, message: 'Chưa có đạo hồ.' }; database_1.default.transaction(() => { database_1.default.prepare(`UPDATE users SET ${field}=?,updated_at=? WHERE discord_id=?`).run(value, Math.floor(Date.now() / 1000), uid); database_1.default.prepare('INSERT INTO appearance_preferences(user_id,field,old_url,new_url,created_at) VALUES(?,?,?,?,?)').run(uid, field, user[field] || '', value, Date.now()); })(); return { ok: true, message: field === 'avatar_url' ? 'Đã đổi diện mạo nhân vật.' : 'Đã đổi ảnh nền hồ sơ.' }; },
    resetThumbnail(uid) { return this.update(uid, 'thumbnail_url', exports.DEFAULT_PROFILE_THUMBNAIL); }
};
