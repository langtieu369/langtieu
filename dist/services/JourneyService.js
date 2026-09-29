"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.journeyService = void 0;
const database_1 = __importDefault(require("../database/database"));
const JourneyCatalog_1 = require("../config/JourneyCatalog");
const JourneyProductionCatalog_1 = require("../config/JourneyProductionCatalog");
const JourneyProductionCatalog_2 = require("../config/JourneyProductionCatalog");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const RewardNotificationService_1 = require("./RewardNotificationService");
const relationshipRank = { stranger: 0, met: 1, known: 2, familiar: 3, trusted: 4, close: 5 };
const now = () => Date.now();
const json = (v, fallback) => { try {
    return v ? JSON.parse(v) : fallback;
}
catch {
    return fallback;
} };
class JourneyService {
    state(uid, jid) { return database_1.default.prepare('SELECT * FROM journey_states WHERE user_id=? AND journey_id=?').get(uid, jid); }
    eligible(uid, d) { if (!database_1.default.prepare('SELECT 1 FROM users WHERE discord_id=?').get(uid))
        return false; if (d.entry.npcId) {
        const k = database_1.default.prepare('SELECT stage FROM player_npc_knowledge WHERE user_id=? AND npc_id=?').get(uid, d.entry.npcId);
        if (!k || relationshipRank[k.stage] < (relationshipRank[d.entry.minRelationship || 'met'] ?? 1))
            return false;
        const count = database_1.default.prepare('SELECT COUNT(*) n FROM npc_memories WHERE user_id=? AND npc_id=?').get(uid, d.entry.npcId).n;
        if (count < (d.entry.minSharedMemories || 0))
            return false;
    } const predecessors = database_1.default.prepare('SELECT from_journey_id FROM journey_edges WHERE to_journey_id=?').all(d.id); if (predecessors.length && !predecessors.some(p => database_1.default.prepare(`SELECT 1 FROM journey_states WHERE user_id=? AND journey_id=? AND status IN ('RESOLVED','AFTERMATH')`).get(uid, p.from_journey_id)))
        return false; return true; }
    available(uid) { return JourneyProductionCatalog_2.PRODUCTION_JOURNEYS.filter(d => !this.state(uid, d.id) && this.eligible(uid, d)); }
    hasFact(uid, fact) { return !!database_1.default.prepare('SELECT 1 FROM knowledge_provenance WHERE user_id=? AND fact_key=?').get(uid, fact); }
    grantKnowledge(uid, fact, kind, sourceRef, confidence = 'linked') { database_1.default.prepare(`INSERT INTO knowledge_provenance(user_id,fact_key,source_kind,source_ref,confidence,learned_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,fact_key,source_kind,source_ref) DO UPDATE SET confidence=excluded.confidence`).run(uid, fact, kind, sourceRef, confidence, now()); }
    provenance(uid, fact) { return database_1.default.prepare('SELECT source_kind,source_ref,confidence FROM knowledge_provenance WHERE user_id=? AND fact_key=? ORDER BY learned_at').all(uid, fact); }
    start(uid, jid) { const d = (0, JourneyProductionCatalog_1.productionJourneyById)(jid); if (!d)
        return { ok: false, message: 'Không tìm thấy Cơ Duyên.' }; const old = this.state(uid, d.id); if (old) {
        if (old.status === 'RESOLVED' || old.status === 'AFTERMATH')
            return this.revisit(uid, d.id);
        return this.view(uid, d.id);
    } if (!this.eligible(uid, d))
        return { ok: false, message: 'Cơ Duyên này chưa tới lúc xuất hiện.' }; const t = now(); database_1.default.prepare(`INSERT INTO journey_states(user_id,journey_id,definition_version,status,current_node,state_json,lock_version,started_at,updated_at) VALUES(?,?,?,?,?,'{}',0,?,?)`).run(uid, d.id, d.version, 'WAITING_INPUT', d.startNode, t, t); database_1.default.prepare('INSERT INTO journey_history(user_id,journey_id,from_node,action_id,to_node,payload_json,created_at) VALUES(?,?,?,?,?,?,?)').run(uid, d.id, null, 'START', d.startNode, '{}', t); return this.view(uid, d.id); }
    view(uid, jid) { const d = (0, JourneyProductionCatalog_1.productionJourneyById)(jid); if (!d)
        return { ok: false, message: 'Không tìm thấy Cơ Duyên.' }; const s = this.state(uid, d.id); if (!s)
        return { ok: false, message: 'Cơ Duyên chưa được khởi hành.' }; const n = d.nodes.find(x => x.id === s.current_node); if (!n)
        return { ok: false, message: 'Tiến trình đang cần migration; chưa có node hợp lệ.' }; return { ok: true, message: n.text, definition: d, state: s, actions: n.actions.filter(a => !a.requiredFact || this.hasFact(uid, a.requiredFact)), provenance: this.provenance(uid, 'lang_tieu_name_canh_huyen') }; }
    pause(uid, jid) { const d = (0, JourneyProductionCatalog_1.productionJourneyById)(jid), s = d && this.state(uid, d.id); if (!d || !s || !['ACTIVE', 'WAITING_INPUT'].includes(s.status))
        return { ok: false, message: 'Không có Cơ Duyên đang chờ để tạm dừng.' }; const x = database_1.default.prepare(`UPDATE journey_states SET status='PAUSED',lock_version=lock_version+1,updated_at=? WHERE user_id=? AND journey_id=? AND lock_version=?`).run(now(), uid, d.id, s.lock_version); return x.changes === 1 ? { ok: true, message: 'Đã ghi lại đúng đoạn đang dở.' } : { ok: false, message: 'Tiến trình vừa thay đổi; hãy mở lại.' }; }
    resume(uid, jid) { const d = (0, JourneyProductionCatalog_1.productionJourneyById)(jid), s = d && this.state(uid, d.id); if (!d || !s || s.status !== 'PAUSED')
        return { ok: false, message: 'Cơ Duyên này không ở trạng thái tạm dừng.' }; database_1.default.prepare(`UPDATE journey_states SET status='WAITING_INPUT',lock_version=lock_version+1,updated_at=? WHERE user_id=? AND journey_id=? AND lock_version=?`).run(now(), uid, d.id, s.lock_version); return this.view(uid, d.id); }
    choose(uid, jid, actionId) { const d = (0, JourneyProductionCatalog_1.productionJourneyById)(jid); if (!d)
        return { ok: false, message: 'Không tìm thấy Cơ Duyên.' }; const out = database_1.default.transaction(() => { const s = this.state(uid, d.id); if (!s || s.status !== 'WAITING_INPUT')
        return { ok: false, message: 'Lựa chọn này không còn hiệu lực.' }; const n = d.nodes.find(x => x.id === s.current_node), a = n?.actions.find(x => x.id === actionId); if (!n || !a || a.requiredFact && !this.hasFact(uid, a.requiredFact))
        return { ok: false, message: 'Lựa chọn này không hợp lệ trong trạng thái hiện tại.' }; const flags = { ...json(s.state_json, {}), ...(a.setFlags || {}) }; if (a.id === 'TELL_SOURCE')
        flags.name_provenance = this.provenance(uid, 'lang_tieu_name_canh_huyen'); const to = a.resolve ? n.id : a.next, status = a.resolve ? 'RESOLVED' : 'WAITING_INPUT'; if (a.resolve) {
        const receipt = `${d.id}:${n.id}:${a.id}:v${d.version}`;
        const inserted = database_1.default.prepare(`INSERT OR IGNORE INTO journey_receipts(user_id,receipt_id,journey_id,node_id,payload_json,status,created_at) VALUES(?,?,?,?,?,'COMMITTED',?)`).run(uid, receipt, d.id, n.id, JSON.stringify({ reward: d.rewardPolicy }), now());
        if (inserted.changes === 1)
            this.settleReward(uid, d.rewardPolicy, d.id);
    } const x = database_1.default.prepare(`UPDATE journey_states SET status=?,current_node=?,state_json=?,lock_version=lock_version+1,updated_at=?,resolved_at=? WHERE user_id=? AND journey_id=? AND lock_version=?`).run(status, to, JSON.stringify(flags), now(), a.resolve ? now() : null, uid, d.id, s.lock_version); if (x.changes !== 1)
        return { ok: false, message: 'Tiến trình vừa thay đổi ở nơi khác; hãy mở lại Cơ Duyên.' }; database_1.default.prepare('INSERT INTO journey_history(user_id,journey_id,from_node,action_id,to_node,payload_json,created_at) VALUES(?,?,?,?,?,?,?)').run(uid, d.id, n.id, a.id, to, JSON.stringify(flags), now()); if (a.resolve) {
        database_1.default.prepare(`INSERT OR IGNORE INTO travel_log_entries(user_id,entry_key,title,body,created_at) VALUES(?,?,?,?,?)`).run(uid, `${d.id}:original`, d.title, this.logText(flags.first_name_choice, d.title, d.id), now());
        if (d.id === JourneyCatalog_1.MOON_NAME_JOURNEY_ID)
            database_1.default.prepare(`INSERT OR IGNORE INTO npc_memories(user_id,npc_id,memory_key,payload_json,created_at) VALUES(?,?,?,?,?)`).run(uid, 'lang_tieu', 'moon_name_original', JSON.stringify(flags), now());
    } return { ok: true, message: a.resolve ? 'Cơ Duyên đã được ghi vào Vân Du Lục.' : d.nodes.find(x => x.id === to)?.text || 'Tiến trình đã được ghi lại.' }; })(); return out.ok && out.message && !out.message.includes('Vân Du Lục') ? this.view(uid, d.id) : out; }
    settleReward(uid, policy, jid) { if (policy.startsWith('DIRECT:')) {
        let overflow = 0, total = 0;
        for (const token of policy.slice(7).split('+')) {
            const [item, raw = '1'] = token.split('*');
            const qty = Math.max(1, Number(raw) || 1), add = InventoryRepository_1.inventoryRepository.add(uid, item, qty);
            overflow += add.overflow;
            total += qty;
        }
        RewardNotificationService_1.rewardNotificationService.push(uid, `JOURNEY:${jid}`, `Cơ Duyên đã trao ${total} vật phẩm.${overflow ? ` ${overflow} vật phẩm đã vào Tạm Nang.` : ''}`, overflow > 0);
        return;
    } if (policy.startsWith('RELIC_CUSTODY:') || policy.startsWith('KEEPSAKE:') || policy.startsWith('RECIPE:')) {
        this.grantKnowledge(uid, `journey_reward:${policy}`, 'CONFIRMED', `journey:${jid}`, 'confirmed');
        RewardNotificationService_1.rewardNotificationService.push(uid, `JOURNEY:${jid}`, 'Cơ Duyên đã ghi nhận vật truyền, kỷ vật hoặc bí phương vào đúng sổ lưu giữ.');
    } }
    logText(choice, title = 'Cơ Duyên', journeyId = '') { if (journeyId === JourneyCatalog_1.MOON_NAME_JOURNEY_ID && choice === 'silence')
        return 'Đêm ấy không ai nói gì thêm. Trăng vẫn sáng rất lâu.'; if (journeyId === JourneyCatalog_1.MOON_NAME_JOURNEY_ID && choice === 'lang_tieu')
        return 'Dưới trăng, ngươi đã gọi cái tên Lăng Tiêu—cái tên của người đang ở trước mắt.'; if (journeyId === JourneyCatalog_1.MOON_NAME_JOURNEY_ID)
        return 'Dưới trăng, ngươi đã gọi Cảnh Huyền. Nguồn của cái tên ấy được giữ nguyên trong ký ức.'; return `Cơ Duyên “${title}” đã kết. Lựa chọn và Duyên Quả được lưu theo đúng nguồn đã trải qua.`; }
    revisit(uid, jid) { const d = (0, JourneyProductionCatalog_1.productionJourneyById)(jid), s = d && this.state(uid, d.id); if (!d || !s)
        return { ok: false, message: 'Chưa có ký ức để ngoảnh lại.' }; const flags = json(s.state_json, {}); if (d.id === JourneyCatalog_1.MOON_NAME_JOURNEY_ID && this.hasFact(uid, 'co_nhan_da_minh')) {
        const c = flags.first_name_choice, answer = c === 'canh_huyen' ? '“Ừ.”' : c === 'lang_tieu' ? '“Ừ, ta đây.”' : 'Lăng Tiêu ngồi cạnh, không hỏi vì sao ngươi lại im lặng.';
        return { ok: true, message: `Ký ức ấy không lặp lại. Ở một ngày rất lâu về sau, lời đáp đã trở nên giản dị: ${answer}`, definition: d, state: { ...s, status: 'AFTERMATH' } };
    } return { ok: true, message: 'Đêm ấy chỉ xảy ra một lần. Vân Du Lục vẫn giữ nguyên lựa chọn của ngươi; Cơ Duyên không reset để xem nhánh khác.', definition: d, state: s }; }
    active(uid) { return database_1.default.prepare(`SELECT * FROM journey_states WHERE user_id=? AND status IN ('ACTIVE','PAUSED','WAITING_INPUT','WAITING_WORLD_STATE') ORDER BY updated_at DESC`).all(uid); }
    migrate(uid, jid) { const d = (0, JourneyProductionCatalog_1.productionJourneyById)(jid), s = d && this.state(uid, d.id); if (!d || !s)
        return { ok: false, message: 'Không có tiến trình để migration.' }; if (s.definition_version === d.version)
        return { ok: true, message: 'Tiến trình đã ở phiên bản mới nhất.' }; const mapped = d.migration[s.definition_version]; if (!mapped) {
        database_1.default.prepare(`UPDATE journey_states SET status='PAUSED',updated_at=? WHERE user_id=? AND journey_id=?`).run(now(), uid, d.id);
        return { ok: false, message: 'Không có đường migration an toàn; tiến trình đã được giữ nguyên và tạm dừng.' };
    } database_1.default.prepare(`UPDATE journey_states SET definition_version=?,current_node=?,lock_version=lock_version+1,updated_at=? WHERE user_id=? AND journey_id=?`).run(d.version, mapped, now(), uid, d.id); return { ok: true, message: 'Đã migration tiến trình.' }; }
}
exports.journeyService = new JourneyService();
