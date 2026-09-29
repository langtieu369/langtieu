"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRuntime = exports.rankingRuntime = exports.partyRuntime = exports.dutyRuntime = exports.intentRuntime = exports.qilingRuntime = exports.companionRuntime = exports.farmRuntime = exports.sectRuntime = void 0;
exports.auditRuntimeTables = auditRuntimeTables;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../database/database"));
const RuntimeCatalog_1 = require("../config/RuntimeCatalog");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const ItemInstanceService_1 = require("./ItemInstanceService");
const GameCatalog_1 = require("../config/GameCatalog");
const UserRepository_1 = require("../database/repositories/UserRepository");
function vn(at = Date.now()) {
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(at));
    const x = Object.fromEntries(p.map(v => [v.type, v.value]));
    return { day: `${x.year}-${x.month}-${x.day}`, weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(x.weekday), hour: +x.hour, minute: +x.minute };
}
function notification(uid, source, message, overflow = false) { database_1.default.prepare('INSERT INTO reward_notifications(user_id,source,message,overflow,created_at) VALUES(?,?,?,?,?)').run(uid, source, message, overflow ? 1 : 0, Date.now()); }
exports.sectRuntime = {
    get(uid) { return database_1.default.prepare('SELECT * FROM sect_memberships WHERE user_id=?').get(uid); },
    join(uid, sectId) {
        const s = RuntimeCatalog_1.SECTS.find(x => x.id === sectId), cd = database_1.default.prepare('SELECT available_at FROM sect_leave_cooldowns WHERE user_id=?').get(uid);
        if (!s)
            return { ok: false, message: 'Tông môn không tồn tại.' };
        if (this.get(uid))
            return { ok: false, message: 'Phải ly môn trước khi nhập môn khác.' };
        if (!database_1.default.prepare("SELECT 1 FROM player_credentials WHERE user_id=? AND credential_id='THAT_MON_BAI_THIEP' AND state='ACTIVE'").get(uid))
            return { ok: false, message: 'Ngươi chưa nhận 《Thất Môn Bái Thiếp》; hãy trở về Động Phủ sau khi hoàn thành Sơ Nhập.' };
        if (cd?.available_at > Date.now())
            return { ok: false, message: `Cần điều tức đủ 24 giờ, có thể nhập môn <t:${Math.floor(cd.available_at / 1000)}:R>.` };
        const role = s.outer ? 'ngoai_mon' : 'noi_mon';
        database_1.default.prepare('INSERT INTO sect_memberships(user_id,sect_id,role_id,joined_at) VALUES(?,?,?,?)').run(uid, s.id, role, Date.now());
        return { ok: true, message: `Đã nhập ${s.name} với thân phận ${RuntimeCatalog_1.SECT_ROLES.find(x => x.id === role).name}.` };
    },
    leave(uid) { if (!this.get(uid))
        return { ok: false, message: 'Chưa có tông môn.' }; database_1.default.transaction(() => { database_1.default.prepare('DELETE FROM sect_memberships WHERE user_id=?').run(uid); database_1.default.prepare('INSERT OR REPLACE INTO sect_leave_cooldowns(user_id,available_at) VALUES(?,?)').run(uid, Date.now() + 24 * 3600_000); })(); return { ok: true, message: 'Đã ly môn; bắt đầu 24 giờ điều tức.' }; },
    activity(uid, activity = 'daily') { const m = this.get(uid), day = vn().day; if (!m)
        return { ok: false, message: 'Chưa có tông môn.' }; try {
        database_1.default.transaction(() => { database_1.default.prepare('INSERT INTO sect_activity_log(user_id,sect_id,activity_id,contribution,day_key,created_at) VALUES(?,?,?,?,?,?)').run(uid, m.sect_id, activity, 80, day, Date.now()); database_1.default.prepare('UPDATE sect_memberships SET contribution=contribution+80 WHERE user_id=?').run(uid); const n = this.get(uid), s = RuntimeCatalog_1.SECTS.find(x => x.id === n.sect_id), role = [...RuntimeCatalog_1.SECT_ROLES].reverse().find(x => x.min <= n.contribution); database_1.default.prepare('UPDATE sect_memberships SET role_id=? WHERE user_id=?').run(!s.outer && role.id === 'ngoai_mon' ? 'noi_mon' : role.id, uid); })();
    }
    catch {
        return { ok: false, message: 'Tông vụ này hôm nay đã hoàn thành.' };
    } return { ok: true, message: '+80 cống hiến; chức vị đã được đối chiếu.' }; },
    canLearn(uid) { const m = this.get(uid); return !!RuntimeCatalog_1.SECT_ROLES.find(x => x.id === m?.role_id)?.learn; }
};
exports.farmRuntime = {
    ensure(uid) { for (let i = 1; i <= 3; i++)
        database_1.default.prepare('INSERT OR IGNORE INTO farm_plots(user_id,plot_no) VALUES(?,?)').run(uid, i); return database_1.default.prepare('SELECT * FROM farm_plots WHERE user_id=? ORDER BY plot_no').all(uid); },
    plant(uid, plot) { this.ensure(uid); const p = database_1.default.prepare('SELECT * FROM farm_plots WHERE user_id=? AND plot_no=?').get(uid, plot); if (!p || p.state !== 'EMPTY')
        return { ok: false, message: 'Thửa đất không trống.' }; if (!InventoryRepository_1.inventoryRepository.remove(uid, 'MAT-HAT-MUA-MUON', 1))
        return { ok: false, message: 'Thiếu Hạt Mùa Muộn.' }; const t = Date.now(); database_1.default.prepare("UPDATE farm_plots SET crop_item_id='thanh_linh_thao',planted_at=?,ready_at=?,state='GROWING' WHERE user_id=? AND plot_no=?").run(t, t + 6 * 3600_000, uid, plot); return { ok: true, message: 'Đã gieo; chín sau 6 giờ.' }; },
    harvest(uid, plot, at = Date.now()) { const p = database_1.default.prepare('SELECT * FROM farm_plots WHERE user_id=? AND plot_no=?').get(uid, plot); if (!p || p.state !== 'GROWING')
        return { ok: false, message: 'Thửa đất chưa có cây.' }; if (at < p.ready_at)
        return { ok: false, message: 'Linh thực chưa chín.' }; const a = InventoryRepository_1.inventoryRepository.add(uid, p.crop_item_id, 3); database_1.default.prepare("UPDATE farm_plots SET crop_item_id=NULL,planted_at=NULL,ready_at=NULL,state='EMPTY' WHERE user_id=? AND plot_no=?").run(uid, plot); notification(uid, 'Linh Điền', `Thu hoạch ${p.crop_item_id} ×3`, a.overflow > 0); return { ok: true, message: `Thu hoạch ×3.${a.overflow ? ' Vật phẩm tràn vào Tạm Nang.' : ''}` }; }
};
exports.companionRuntime = {
    list(uid, kind) { return database_1.default.prepare(`SELECT * FROM companion_ownership WHERE user_id=?${kind ? ' AND kind=?' : ''}`).all(...(kind ? [uid, kind] : [uid])); },
    grant(uid, id) { const t = RuntimeCatalog_1.COMPANIONS.find(x => x.id === id); if (!t)
        return { ok: false, message: 'Linh vật không tồn tại.' }; try {
        database_1.default.prepare('INSERT INTO companion_ownership(user_id,template_id,kind,name,element,rarity,source,created_at) VALUES(?,?,?,?,?,?,?,?)').run(uid, t.id, t.kind, t.name, t.element, t.rarity, t.source, Date.now());
    }
    catch {
        return { ok: false, message: 'Đã sở hữu linh vật này.' };
    } return { ok: true, message: `Đã nhận ${t.name} từ ${t.source}.` }; },
    feed(uid, id) { const x = database_1.default.prepare('SELECT * FROM companion_ownership WHERE id=? AND user_id=?').get(id, uid); if (!x)
        return { ok: false, message: 'Không tìm thấy linh vật.' }; const food = x.kind === 'pet' ? 'beast_0' : 'food_0'; if (!InventoryRepository_1.inventoryRepository.remove(uid, food, 1))
        return { ok: false, message: `Thiếu thức ăn ${food}.` }; database_1.default.prepare('UPDATE companion_ownership SET growth=growth+10 WHERE id=?').run(id); return { ok: true, message: '+10 trưởng thành.' }; },
    advance(uid, id) { const x = database_1.default.prepare('SELECT * FROM companion_ownership WHERE id=? AND user_id=?').get(id, uid); if (!x || x.growth < x.stage * 50)
        return { ok: false, message: 'Chưa đủ trưởng thành.' }; const core = `beast_${Math.min(9, x.stage)}`; if (!InventoryRepository_1.inventoryRepository.remove(uid, core, 2))
        return { ok: false, message: `Thiếu ${core} ×2.` }; database_1.default.prepare('UPDATE companion_ownership SET stage=stage+1,growth=0 WHERE id=?').run(id); return { ok: true, message: `Đã tiến lên bậc ${x.stage + 1}.` }; },
    equip(uid, id) { const x = database_1.default.prepare('SELECT * FROM companion_ownership WHERE id=? AND user_id=?').get(id, uid); if (!x)
        return { ok: false, message: 'Không tìm thấy linh vật.' }; database_1.default.transaction(() => { database_1.default.prepare('UPDATE companion_ownership SET equipped=0 WHERE user_id=? AND kind=?').run(uid, x.kind); database_1.default.prepare('UPDATE companion_ownership SET equipped=1 WHERE id=?').run(id); })(); return { ok: true, message: `${x.name} đang đồng hành.` }; }
};
exports.qilingRuntime = {
    list(uid) { return database_1.default.prepare('SELECT s.*,i.template_id,i.binding FROM spirit_cores s JOIN item_instances i ON i.instance_id=s.instance_id WHERE s.user_id=?').all(uid); },
    seed(uid, instanceId, chance = .25) { const x = ItemInstanceService_1.itemInstanceService.get(instanceId); if (!x || x.owner_id !== uid || x.kind !== 'weapon')
        return { ok: false, message: 'Chỉ vũ khí của bản thân mới sinh Linh Cơ.' }; if (database_1.default.prepare('SELECT 1 FROM spirit_cores WHERE instance_id=?').get(instanceId))
        return { ok: false, message: 'Vật Mang đã có Linh Cơ.' }; if (Math.random() > chance)
        return { ok: true, message: 'Lần rèn dưỡng này chưa sinh Linh Cơ.' }; database_1.default.transaction(() => { database_1.default.prepare("INSERT INTO spirit_cores(instance_id,user_id,stage,updated_at) VALUES(?,?,'LINH_CO',?)").run(instanceId, uid, Date.now()); database_1.default.prepare("UPDATE item_instances SET state='LINH_CO',updated_at=? WHERE instance_id=?").run(Date.now(), instanceId); })(); return { ok: true, message: 'Vũ khí đã sinh Linh Cơ.' }; },
    nurture(uid, instanceId) { const s = database_1.default.prepare('SELECT * FROM spirit_cores WHERE instance_id=? AND user_id=?').get(instanceId, uid); if (!s)
        return { ok: false, message: 'Vũ khí chưa có Linh Cơ.' }; const i = RuntimeCatalog_1.QILING_STAGES.indexOf(s.stage), need = [20, 60, 140, 9999][i], next = s.insight + 10; if (next < need) {
        database_1.default.prepare('UPDATE spirit_cores SET insight=?,accord=accord+2,updated_at=? WHERE instance_id=?').run(next, Date.now(), instanceId);
        return { ok: true, message: `${RuntimeCatalog_1.QILING_NAMES[s.stage]}: ${next}/${need}.` };
    } const stage = RuntimeCatalog_1.QILING_STAGES[i + 1]; if (!stage)
        return { ok: false, message: 'Khí Linh đã thức tỉnh hoàn toàn.' }; database_1.default.transaction(() => { database_1.default.prepare('UPDATE spirit_cores SET stage=?,insight=0,accord=accord+5,consent=CASE WHEN ?=? THEN 1 ELSE consent END,updated_at=? WHERE instance_id=?').run(stage, stage, 'THUC_TINH', Date.now(), instanceId); database_1.default.prepare('UPDATE item_instances SET state=?,binding=?,updated_at=? WHERE instance_id=?').run(stage, stage === 'THUC_TINH' ? 'SOULBOUND' : 'UNBOUND', Date.now(), instanceId); })(); return { ok: true, message: `Tiến vào ${RuntimeCatalog_1.QILING_NAMES[stage]}.` }; }
};
exports.intentRuntime = { practice(uid, kind, school) { const x = database_1.default.prepare('SELECT * FROM intent_progress WHERE user_id=? AND kind=?').get(uid, kind), exp = (x?.exp || 0) + 10, stage = Math.min(4, Math.floor(exp / 50)); database_1.default.prepare('INSERT INTO intent_progress(user_id,kind,school,stage,exp,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,kind) DO UPDATE SET school=excluded.school,stage=excluded.stage,exp=excluded.exp,updated_at=excluded.updated_at').run(uid, kind, school, stage, exp, Date.now()); return { ok: true, message: `${kind}: ${exp} lĩnh ngộ · tầng ${stage}.` }; } };
exports.dutyRuntime = {
    today(uid) { const day = vn().day; let a = database_1.default.prepare('SELECT * FROM duty_assignments WHERE user_id=? AND day_key=?').all(uid, day); if (a.length)
        return a; const q = database_1.default.prepare('INSERT INTO duty_assignments(id,user_id,day_key,duty_type,title,target,reward_lt,reward_tuvi,reward_cplt,reward_item,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)'), seed = [...uid].reduce((n, c) => n + c.charCodeAt(0), 0); database_1.default.transaction(() => { for (let i = 0; i < 6; i++) {
        const x = RuntimeCatalog_1.DUTY_TYPES[(seed + i) % 8];
        q.run((0, crypto_1.randomUUID)(), uid, day, x[0], `${x[1]} · ${i + 1}`, i === 5 ? 2 : 1, 500 + i * 180, 80 + i * 30, i === 5 ? 1 : 0, i === 5 ? 'tranhai_lenh' : null, Date.now());
    } })(); return database_1.default.prepare('SELECT * FROM duty_assignments WHERE user_id=? AND day_key=?').all(uid, day); },
    progress(uid, type, n = 1) { const x = database_1.default.prepare("SELECT * FROM duty_assignments WHERE user_id=? AND day_key=? AND duty_type=? AND status='ACTIVE' LIMIT 1").get(uid, vn().day, type); if (x)
        database_1.default.prepare('UPDATE duty_assignments SET progress=MIN(target,progress+?) WHERE id=?').run(n, x.id); },
    claim(uid, id) { const x = database_1.default.prepare('SELECT * FROM duty_assignments WHERE id=? AND user_id=?').get(id, uid); if (!x || x.status !== 'ACTIVE' || x.progress < x.target)
        return { ok: false, message: 'Nghĩa vụ chưa đủ tiến độ hoặc đã nhận.' }; const a = x.reward_item ? InventoryRepository_1.inventoryRepository.add(uid, x.reward_item, 1) : { overflow: 0 }; database_1.default.transaction(() => { database_1.default.prepare("UPDATE duty_assignments SET status='CLAIMED' WHERE id=?").run(id); database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham+?,tu_vi=tu_vi+?,knb=knb+? WHERE discord_id=?').run(x.reward_lt, x.reward_tuvi, x.reward_cplt, uid); })(); notification(uid, 'Bảng Nghĩa Vụ', `${x.reward_lt} LT · ${x.reward_tuvi} Tu Vi`, a.overflow > 0); return { ok: true, message: `Đã quyết toán.${a.overflow ? ' Vật phẩm tràn vào Tạm Nang.' : ''}` }; }
};
exports.partyRuntime = {
    current(uid) { return database_1.default.prepare('SELECT p.* FROM party_lobbies p JOIN party_members m ON m.party_id=p.id WHERE m.user_id=?').get(uid); },
    open() { return database_1.default.prepare("SELECT p.*,u.name,(SELECT COUNT(*) FROM party_members m WHERE m.party_id=p.id) member_count FROM party_lobbies p JOIN users u ON u.discord_id=p.leader_id WHERE p.status='FORMING' ORDER BY p.created_at DESC").all(); },
    members(id) { return database_1.default.prepare('SELECT m.*,u.name,u.hp,u.max_hp,u.level FROM party_members m JOIN users u ON u.discord_id=m.user_id WHERE m.party_id=?').all(id); },
    create(uid, realmId) { const r = GameCatalog_1.SECRET_REALMS.find(x => x.id === realmId), u = UserRepository_1.userRepository.get(uid); if (!r || !u || (0, GameCatalog_1.realmOf)(u.level).rank < r.minRealm)
        return { ok: false, message: 'Không đủ điều kiện lập đội.' }; if (this.current(uid))
        return { ok: false, message: 'Đang ở trong tổ đội.' }; const id = (0, crypto_1.randomUUID)(); database_1.default.transaction(() => { database_1.default.prepare('INSERT INTO party_lobbies(id,leader_id,realm_id,created_at,updated_at) VALUES(?,?,?,?,?)').run(id, uid, realmId, Date.now(), Date.now()); database_1.default.prepare('INSERT INTO party_members(party_id,user_id,ready,joined_at) VALUES(?,?,1,?)').run(id, uid, Date.now()); })(); return { ok: true, id, message: 'Đã lập đội.' }; },
    join(uid, id) { const p = database_1.default.prepare("SELECT * FROM party_lobbies WHERE id=? AND status='FORMING'").get(id); if (!p || this.members(id).length >= 4 || this.current(uid))
        return { ok: false, message: 'Không thể gia nhập đội.' }; const r = GameCatalog_1.SECRET_REALMS.find(x => x.id === p.realm_id), u = UserRepository_1.userRepository.get(uid); if ((0, GameCatalog_1.realmOf)(u.level).rank < r.minRealm)
        return { ok: false, message: 'Cảnh giới chưa đủ.' }; database_1.default.prepare('INSERT INTO party_members(party_id,user_id,joined_at) VALUES(?,?,?)').run(id, uid, Date.now()); return { ok: true, message: 'Đã gia nhập; hãy sẵn sàng.' }; },
    ready(uid) { database_1.default.prepare('UPDATE party_members SET ready=1-ready WHERE user_id=?').run(uid); return { ok: true, message: 'Đã đổi trạng thái.' }; },
    changeRealm(uid, realmId) { const p = this.current(uid), r = GameCatalog_1.SECRET_REALMS.find(x => x.id === realmId); if (!p || p.leader_id !== uid || !r)
        return { ok: false, message: 'Không có quyền đổi bí cảnh.' }; if (this.members(p.id).some(x => (0, GameCatalog_1.realmOf)(x.level).rank < r.minRealm))
        return { ok: false, message: 'Có thành viên không đủ cảnh giới.' }; database_1.default.prepare('UPDATE party_lobbies SET realm_id=?,updated_at=? WHERE id=?').run(realmId, Date.now(), p.id); return { ok: true, message: 'Đã đổi bí cảnh.' }; },
    start(uid) { const p = this.current(uid); if (!p || p.leader_id !== uid || p.status !== 'FORMING')
        return { ok: false, message: 'Không thể bắt đầu.' }; if (this.members(p.id).some(x => !x.ready))
        return { ok: false, message: 'Còn thành viên chưa sẵn sàng.' }; database_1.default.prepare("UPDATE party_lobbies SET status='RUNNING',updated_at=? WHERE id=?").run(Date.now(), p.id); return { ok: true, message: 'Đã vào bí cảnh.' }; },
    heal(uid) { const p = this.current(uid); if (!p || p.status !== 'RUNNING')
        return { ok: false, message: 'Không trong bí cảnh tổ đội.' }; const injured = database_1.default.prepare('SELECT u.discord_id FROM users u JOIN party_members m ON m.user_id=u.discord_id WHERE m.party_id=? AND u.hp<u.max_hp').all(p.id); if (!injured.length)
        return { ok: false, message: 'Cả đội đang đầy HP.' }; if (InventoryRepository_1.inventoryRepository.quantity(uid, 'pill_0') < injured.length)
        return { ok: false, message: `Cần ${injured.length} viên đan HP; mỗi người được hồi dùng một liều.` }; database_1.default.transaction(() => { InventoryRepository_1.inventoryRepository.remove(uid, 'pill_0', injured.length); for (const x of injured)
        database_1.default.prepare('UPDATE users SET hp=max_hp WHERE discord_id=?').run(x.discord_id); })(); return { ok: true, message: `Đã dùng ${injured.length} viên đan, hồi đầy HP cho ${injured.length} thành viên.` }; }
};
exports.rankingRuntime = { board(type, limit = 20) { if (type === 'QUAN_HUNG')
        return database_1.default.prepare("SELECT discord_id user_id,name,pvp_rating score FROM users WHERE title!='TEST_ACCOUNT' ORDER BY score DESC LIMIT ?").all(limit); if (type === 'DAI_YEU')
        return database_1.default.prepare("SELECT s.user_id,u.name,SUM(s.damage) score FROM world_event_scores s JOIN users u ON u.discord_id=s.user_id WHERE u.title!='TEST_ACCOUNT' GROUP BY s.user_id ORDER BY score DESC LIMIT ?").all(limit); return database_1.default.prepare("SELECT discord_id user_id,name,pvp_rating+pvp_wins*25 score FROM users WHERE title!='TEST_ACCOUNT' ORDER BY score DESC LIMIT ?").all(limit); } };
exports.eventRuntime = { tick(at = Date.now()) { const z = vn(at), made = []; for (const s of RuntimeCatalog_1.EVENT_SCHEDULE) {
        if (!s.days.includes(z.weekday) || z.hour < s.hour)
            continue;
        const start = at - (z.hour - s.hour) * 3600_000 - z.minute * 60_000, end = start + s.duration * 60_000;
        if (at > end)
            continue;
        const key = `${s.type}:${z.day}`, id = (0, crypto_1.randomUUID)(), r = database_1.default.prepare("INSERT OR IGNORE INTO world_event_runs(id,event_type,scheduled_key,status,starts_at,ends_at,created_at,updated_at) VALUES(?,?,?,'ACTIVE',?,?,?,?)").run(id, s.type, key, start, end, at, at);
        if (r.changes)
            made.push(s.name);
    } database_1.default.prepare("UPDATE world_event_runs SET status='CLOSED',updated_at=? WHERE status='ACTIVE' AND ends_at<=?").run(at, at); return made; }, active() { return database_1.default.prepare("SELECT * FROM world_event_runs WHERE status='ACTIVE' AND ends_at>?").all(Date.now()); } };
function auditRuntimeTables() { const need = ['sect_memberships', 'farm_plots', 'companion_ownership', 'spirit_cores', 'intent_progress', 'duty_assignments', 'party_lobbies', 'world_event_runs', 'auction_listings', 'reward_notifications', 'appearance_preferences', 'owner_settings', 'test_namespaces', 'world_announcements', 'world_meta', 'world_reset_jobs', 'owner_mutations', 'content_definitions', 'system_repairs', 'realm_npc_visits', 'onboarding_milestones', 'player_credentials', 'interaction_receipts', 'interaction_rate_limits']; return need.filter(t => !database_1.default.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t)).map(t => `${t}: missing runtime table`); }
