"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cultivationService = void 0;
const database_1 = __importDefault(require("../database/database"));
const GameCatalog_1 = require("../config/GameCatalog");
const UserRepository_1 = require("../database/repositories/UserRepository");
const EquipmentService_1 = require("./EquipmentService");
const RealmNpcVisitService_1 = require("./RealmNpcVisitService");
function need(level) { return Math.floor(100 + level * 25 + Math.pow(level, 1.18) * 8); }
exports.cultivationService = {
    addTuVi(uid, amount) { const u = UserRepository_1.userRepository.get(uid); if (!u || amount <= 0)
        return { gained: 0, full: false, message: '' }; const bonus = EquipmentService_1.equipmentService.stats(uid).tuViPct || 0, adjusted = Math.max(1, Math.floor(amount * (1 + bonus))), before = u.tu_vi; const tu = Math.min(u.exp_needed, before + adjusted); const gained = tu - before; database_1.default.prepare('UPDATE users SET tu_vi=?,updated_at=? WHERE discord_id=?').run(tu, Math.floor(Date.now() / 1000), uid); return { gained, full: tu >= u.exp_needed, message: tu >= u.exp_needed ? '🌌 Tu Vi đã viên mãn. Có thể **Đột Phá**.' : '' }; },
    meditate(uid) { const u = UserRepository_1.userRepository.get(uid); if (!u)
        return { ok: false, message: 'Đạo hữu chưa lập đạo hồ.' }; if (u.tu_vi >= u.exp_needed)
        return { ok: false, message: '🌌 Tu Vi đã viên mãn. Hãy Đột Phá trước khi tiếp tục Bế Quan.' }; const r = (0, GameCatalog_1.realmOf)(u.level); const cost = 18 + r.rank * 2; if (u.stamina < cost)
        return { ok: false, message: `Khí lực chưa đủ. Bế Quan cần **${cost}** Khí Lực.` }; const hasManual = !!database_1.default.prepare("SELECT 1 FROM knowledge_provenance WHERE user_id=? AND fact_key='manual:sach_khai_kinh'").get(uid), gain = Math.floor((45 + r.rank * 35 + Math.floor(Math.random() * 30)) * (hasManual ? 1.05 : 1)); database_1.default.prepare('UPDATE users SET stamina=stamina-? WHERE discord_id=?').run(cost, uid); const g = this.addTuVi(uid, gain); return { ok: true, message: `🧘 Bế Quan một chu thiên, thu được **${g.gained} Tu Vi**.${hasManual ? ' Sách Khai Kinh giúp ổn định dẫn khí.' : ''}${g.message ? `\n${g.message}` : ''}` }; },
    breakthrough(uid) { const u = UserRepository_1.userRepository.get(uid); if (!u)
        return { ok: false, message: 'Đạo hữu chưa lập đạo hồ.' }; if (u.tu_vi < u.exp_needed)
        return { ok: false, message: `Tu Vi chưa viên mãn: **${u.tu_vi}/${u.exp_needed}**.` }; const before = (0, GameCatalog_1.realmOf)(u.level).rank; const level = u.level + 1; const after = (0, GameCatalog_1.realmOf)(level).rank; const exp = need(level); const title = (0, GameCatalog_1.realmTitle)(level, u.title); database_1.default.prepare('UPDATE users SET level=?,tu_vi=0,exp_needed=?,title=?,updated_at=? WHERE discord_id=?').run(level, exp, title, Math.floor(Date.now() / 1000), uid); const realmChanged = after > before; if (realmChanged)
        RealmNpcVisitService_1.realmNpcVisitService.onRealmReached(uid, after); return { ok: true, realmChanged, message: realmChanged ? `🌌 **Đột Phá thành công!** Cảnh giới thăng tiến: **${GameCatalog_1.REALMS[after].name}**${after === 9 ? '\n✨ Tiên môn rộng mở — danh hiệu **✨✦ Tiên Nhân ✦✨** đã được khắc vào đạo hồ.' : ''}` : `✨ Đột Phá thành công, đạo hạnh tăng đến **cấp ${level}**.` }; }
};
