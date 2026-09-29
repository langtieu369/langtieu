"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worldEventGameplay = void 0;
const database_1 = __importDefault(require("../database/database"));
const StatsService_1 = require("./StatsService");
const UserRepository_1 = require("../database/repositories/UserRepository");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const RewardNotificationService_1 = require("./RewardNotificationService");
function state(run) { const x = JSON.parse(run.state_json || '{}'); if (run.event_type === 'DAI_YEU' && !x.maxHp) {
    x.maxHp = 2_000_000;
    x.hp = x.maxHp;
    x.boss = 'Thương Mang Huyền Giáp';
    x.phase = 1;
} if (run.event_type === 'PHA_GIOI' && !x.location) {
    x.location = 'Mạc Lĩnh';
    x.tracks = ['tran_ap', 'cuu_vien', 'ho_tong', 'ho_sinh'];
} return x; }
function active(type) { return database_1.default.prepare("SELECT * FROM world_event_runs WHERE event_type=? AND status='ACTIVE' AND ends_at>? ORDER BY starts_at DESC LIMIT 1").get(type, Date.now()); }
exports.worldEventGameplay = {
    view(type) { const r = active(type); return r ? { run: r, state: state(r) } : null; },
    attack(uid) { if (UserRepository_1.userRepository.get(uid)?.title === 'TEST_ACCOUNT')
        return { ok: false, message: 'Tài khoản thử nghiệm không ghi điểm World Event.' }; const r = active('DAI_YEU'); if (!r)
        return { ok: false, message: 'Đại Yêu Hoành Thế hiện chưa mở.' }; const last = database_1.default.prepare("SELECT last_at FROM world_event_actions WHERE run_id=? AND user_id=? AND action_key='attack'").get(r.id, uid); if (last && Date.now() - last.last_at < 30_000)
        return { ok: false, message: `Còn ${Math.ceil((30_000 - (Date.now() - last.last_at)) / 1000)} giây mới có thể xuất thủ.` }; const u = UserRepository_1.userRepository.get(uid), s = StatsService_1.statsService.get(uid); if (!u || !s || u.stamina < 10 || u.hp <= 0)
        return { ok: false, message: 'Không đủ Khí Lực hoặc đang trọng thương.' }; const st = state(r), damage = Math.max(1, Math.floor(s.power * (.42 + Math.random() * .18))), taken = Math.random() < .16 ? Math.max(1, Math.floor(u.max_hp * (.12 + Math.random() * .18))) : 0; st.hp = Math.max(0, st.hp - damage); st.phase = st.hp <= st.maxHp * .25 ? 3 : st.hp <= st.maxHp * .6 ? 2 : 1; database_1.default.transaction(() => { database_1.default.prepare('UPDATE users SET stamina=stamina-10,hp=MAX(0,hp-?) WHERE discord_id=?').run(taken, uid); database_1.default.prepare('UPDATE world_event_runs SET state_json=?,status=?,updated_at=? WHERE id=?').run(JSON.stringify(st), st.hp <= 0 ? 'CLOSED' : 'ACTIVE', Date.now(), r.id); database_1.default.prepare(`INSERT INTO world_event_scores(run_id,user_id,score,damage) VALUES(?,?,?,?) ON CONFLICT(run_id,user_id) DO UPDATE SET score=score+excluded.score,damage=damage+excluded.damage`).run(r.id, uid, damage, damage); database_1.default.prepare(`INSERT INTO world_event_actions(run_id,user_id,action_key,last_at,count) VALUES(?,?,'attack',?,1) ON CONFLICT(run_id,user_id,action_key) DO UPDATE SET last_at=excluded.last_at,count=count+1`).run(r.id, uid, Date.now()); })(); if (st.hp <= 0)
        this.settle(r.id); return { ok: true, message: `Gây ${damage.toLocaleString()} sát thương · Đại Yêu còn ${st.hp.toLocaleString()}/${st.maxHp.toLocaleString()}${taken ? ` · chịu ${taken} thương thế` : ''}.` }; },
    healNpc(uid) { const u = UserRepository_1.userRepository.get(uid); if (!u)
        return { ok: false, message: 'Không tìm thấy đạo hồ.' }; const missing = u.max_hp - u.hp; if (missing <= 0)
        return { ok: false, message: 'Sinh lực đang viên mãn.' }; const cost = Math.max(50, Math.ceil(missing * 5)); if (u.coin_ha_pham < cost)
        return { ok: false, message: `Cần ${cost} LT để NPC trị thương.` }; database_1.default.prepare('UPDATE users SET hp=max_hp,coin_ha_pham=coin_ha_pham-? WHERE discord_id=?').run(cost, uid); return { ok: true, message: `NPC đã trị thương đầy HP, tiêu hao ${cost} LT.` }; },
    breach(uid, track) { const r = active('PHA_GIOI'), u = UserRepository_1.userRepository.get(uid), s = StatsService_1.statsService.get(uid); if (u?.title === 'TEST_ACCOUNT')
        return { ok: false, message: 'Tài khoản thử nghiệm không ghi điểm World Event.' }; if (!r || !u || !s)
        return { ok: false, message: 'Hung Thú Phá Giới hiện chưa mở.' }; if (!state(r).tracks.includes(track) || u.stamina < 12)
        return { ok: false, message: 'Nhánh không hợp lệ hoặc thiếu 12 Khí Lực.' }; const points = Math.max(10, Math.floor(Math.sqrt(s.power) * 8)); database_1.default.transaction(() => { database_1.default.prepare('UPDATE users SET stamina=stamina-12 WHERE discord_id=?').run(uid); database_1.default.prepare(`INSERT INTO world_event_scores(run_id,user_id,score,support) VALUES(?,?,?,?) ON CONFLICT(run_id,user_id) DO UPDATE SET score=score+excluded.score,support=support+excluded.support`).run(r.id, uid, points, points); database_1.default.prepare(`INSERT INTO world_event_actions(run_id,user_id,action_key,last_at,count) VALUES(?,?,?,?,1) ON CONFLICT(run_id,user_id,action_key) DO UPDATE SET last_at=excluded.last_at,count=count+1`).run(r.id, uid, track, Date.now()); })(); return { ok: true, message: `Mạc Lĩnh ghi nhận ${points} điểm ${track}.` }; },
    settle(runId) { const r = database_1.default.prepare('SELECT * FROM world_event_runs WHERE id=?').get(runId); if (!r)
        return 0; const a = database_1.default.prepare("SELECT s.* FROM world_event_scores s JOIN users u ON u.discord_id=s.user_id WHERE s.run_id=? AND s.score>0 AND u.title!='TEST_ACCOUNT' ORDER BY s.score DESC").all(runId), total = a.reduce((n, x) => n + x.score, 0); database_1.default.transaction(() => a.forEach((x, i) => { if (database_1.default.prepare('SELECT 1 FROM world_event_rewards WHERE run_id=? AND user_id=?').get(runId, x.user_id))
        return; const share = total ? x.score / total : 0, lt = Math.floor((r.event_type === 'DAI_YEU' ? 20_000 : 15_000) * (share + .05)), cplt = r.event_type === 'PHA_GIOI' ? (i < 3 ? 2 : 1) : (i === 0 ? 2 : share >= .05 ? 1 : 0), tuvi = Math.floor(300 + x.score * .08), item = r.event_type === 'DAI_YEU' ? 'boss_tan_tinh' : 'tranhai_lenh', add = InventoryRepository_1.inventoryRepository.add(x.user_id, item, 1); database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham+?,knb=knb+?,tu_vi=tu_vi+? WHERE discord_id=?').run(lt, cplt, tuvi, x.user_id); database_1.default.prepare('INSERT INTO world_event_rewards(run_id,user_id,reward_json,claimed_at) VALUES(?,?,?,?)').run(runId, x.user_id, JSON.stringify({ lt, cplt, tuvi, item, overflow: add.overflow }), Date.now()); RewardNotificationService_1.rewardNotificationService.push(x.user_id, `WORLD_EVENT:${runId}`, `Đã nhận thưởng World Event: ${lt} LT, ${tuvi} Tu Vi, ${cplt} CPLT và 1 vật phẩm.${add.overflow ? ' Vật phẩm đã vào Tạm Nang.' : ''}`, add.overflow > 0); }))(); database_1.default.prepare("UPDATE world_event_runs SET status='CLOSED',updated_at=? WHERE id=?").run(Date.now(), runId); return a.length; }
};
