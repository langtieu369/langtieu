"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const database_1 = __importDefault(require("../database"));
class UserRepository {
    get(id) { return database_1.default.prepare('SELECT * FROM users WHERE discord_id=?').get(id) || null; }
    create(id, name, avatarUrl = '', thumbnailUrl = '', c = {}) { const n = Math.floor(Date.now() / 1000); database_1.default.transaction(() => { database_1.default.prepare(`INSERT INTO users(discord_id,name,avatar_url,thumbnail_url,background_id,destiny_id,linh_can_json,linh_can_main,linh_can_grade,heirloom_id,heirloom_name,prophecy,innate_skill,max_hp,hp,atk,def,max_mp,mp,speed,coin_ha_pham,knb,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, name, avatarUrl, thumbnailUrl, c.backgroundId || '', c.destinyId || '', c.linhCanJson || '{}', c.linhCanMain || '', c.linhCanGrade || '', c.heirloomId || '', c.heirloomName || '', c.prophecy || '', c.innateSkill || '', 100 + (c.hpBonus || 0), 100 + (c.hpBonus || 0), 15 + (c.atkBonus || 0), 10 + (c.defBonus || 0), 50 + (c.mpBonus || 0), 50 + (c.mpBonus || 0), 100 + (c.speedBonus || 0), 100 + (c.ltBonus || 0), c.knbBonus || 0, n, n); database_1.default.prepare('INSERT INTO onboarding_milestones(user_id,milestone,completed_at) VALUES(?,?,?)').run(id, 'SO_NHAP_COMPLETED', n * 1000); })(); return this.get(id); }
    update(id, data) { const entries = Object.entries(data); if (!entries.length)
        return; const keys = entries.map(([k]) => `${k}=?`).join(','); const vals = entries.map(([, v]) => v); database_1.default.prepare(`UPDATE users SET ${keys},updated_at=? WHERE discord_id=?`).run(...vals, Math.floor(Date.now() / 1000), id); }
}
exports.userRepository = new UserRepository();
