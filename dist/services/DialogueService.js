"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialogueService = void 0;
const database_1 = __importDefault(require("../database/database"));
const NpcCatalog_1 = require("../config/NpcCatalog");
class DialogueService {
    seedPresence() { const q = database_1.default.prepare(`INSERT INTO npc_presence(npc_id,location_id,state,updated_at) VALUES(?,?,'available',?) ON CONFLICT(npc_id) DO NOTHING`); const d = database_1.default.prepare(`INSERT INTO dialogue_catalog(line_id,speaker_id,family,text,meta_json,provenance) VALUES(?,?,?,?,?,?) ON CONFLICT(line_id) DO UPDATE SET speaker_id=excluded.speaker_id,family=excluded.family,text=excluded.text,meta_json=excluded.meta_json,provenance=excluded.provenance`); const now = Date.now(); database_1.default.transaction(() => { NpcCatalog_1.NPCS.filter(n => n.lifeState === 'current').forEach(n => q.run(n.id, n.home, now)); NpcCatalog_1.DIALOGUE_LINES.forEach(l => d.run(l.id, l.speakerId, l.family, l.text, JSON.stringify({ locations: l.locations || [], requiredFacts: l.requiredFacts || [], forbiddenFacts: l.forbiddenFacts || [], requiredMemoryKeys: l.requiredMemoryKeys || [], relationshipStages: l.relationshipStages || [], once: !!l.once, cooldownSeconds: l.cooldownSeconds || 0 }), l.provenance)); })(); }
    presence(npcId) { return database_1.default.prepare(`SELECT * FROM npc_presence WHERE npc_id=?`).get(npcId); }
    meet(userId, npcId) { const now = Date.now(); database_1.default.prepare(`INSERT INTO player_npc_knowledge(user_id,npc_id,stage,facts_json,first_met_at,last_met_at) VALUES(?,?,'met','[]',?,?) ON CONFLICT(user_id,npc_id) DO UPDATE SET last_met_at=excluded.last_met_at,version=player_npc_knowledge.version+1`).run(userId, npcId, now, now); }
    facts(userId, npcId) { const r = database_1.default.prepare(`SELECT facts_json FROM player_npc_knowledge WHERE user_id=? AND npc_id=?`).get(userId, npcId); try {
        return new Set(JSON.parse(r?.facts_json || '[]'));
    }
    catch {
        return new Set();
    } }
    grantFact(userId, npcId, fact) { this.meet(userId, npcId); const f = this.facts(userId, npcId); f.add(fact); database_1.default.prepare(`UPDATE player_npc_knowledge SET facts_json=?,version=version+1 WHERE user_id=? AND npc_id=?`).run(JSON.stringify([...f]), userId, npcId); }
    remember(userId, npcId, key, payload = {}) { this.meet(userId, npcId); database_1.default.prepare(`INSERT INTO npc_memories(user_id,npc_id,memory_key,payload_json,created_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,npc_id,memory_key) DO UPDATE SET payload_json=excluded.payload_json,created_at=excluded.created_at`).run(userId, npcId, key, JSON.stringify(payload), Date.now()); }
    setStage(userId, npcId, stage) { this.meet(userId, npcId); database_1.default.prepare(`UPDATE player_npc_knowledge SET stage=?,version=version+1 WHERE user_id=? AND npc_id=?`).run(stage, userId, npcId); }
    memoryRows(userId, npcId) { return database_1.default.prepare(`SELECT memory_key,payload_json,created_at FROM npc_memories WHERE user_id=? AND npc_id=? ORDER BY created_at DESC`).all(userId, npcId); }
    render(text, ctx, mem) { let recent = ctx.recentEvent || '', shared = ctx.sharedMemory || '', choice = ctx.playerChoice || ''; for (const m of mem) {
        let p = {};
        try {
            p = JSON.parse(m.payload_json || '{}');
        }
        catch { }
        recent ||= p.event || p.summary || '';
        shared ||= p.memory || p.summary || '';
        choice ||= p.choice || '';
    } const locationNames = { hoa_chan: 'Hoa Chân', ngoc_tieu: 'Dược Điền Ngọc Tiêu', diem_linh: 'Diễm Linh Cốc', bat_vu: 'Bất Vu Sơn', huyen_nguyen: 'Huyền Nguyên', tam_sinh_dao: 'Tầm Sinh Đảo', vu_lien_dam: 'Vụ Liên Đàm', an_duoc_o: 'Ẩn Dược Ổ' }; const location = locationNames[ctx.location] || ctx.location.replaceAll('_', ' '); return text.replaceAll('{{location}}', location || 'nơi này').replaceAll('{{recent_event}}', recent || 'chuyện vừa qua vẫn còn vài dấu chưa lắng').replaceAll('{{shared_memory}}', shared || 'lần trước chúng ta đã dừng ở đâu').replaceAll('{{player_choice}}', choice || 'cách ngươi chọn khi ấy chưa mất ý nghĩa'); }
    canTalk(_userId, npcId, location) { const n = (0, NpcCatalog_1.npcById)(npcId), p = this.presence(npcId); if (!n || n.lifeState !== 'current')
        return { ok: false, message: 'Người này chỉ còn trong ghi chép lịch sử.' }; if (!p || p.state !== 'available')
        return { ok: false, message: `${n.name} hiện đang bận, chưa thể trò chuyện.` }; if (p.location_id !== location)
        return { ok: false, message: `${n.name} hiện không có mặt tại đây.` }; return { ok: true, message: '' }; }
    resolve(userId, npcId, ctx) {
        const gate = this.canTalk(userId, npcId, ctx.location);
        if (!gate.ok)
            return { ...gate, line: null };
        this.meet(userId, npcId);
        const facts = this.facts(userId, npcId), now = Date.now(), mem = this.memoryRows(userId, npcId), memoryKeys = new Set(mem.map(x => x.memory_key));
        const row = database_1.default.prepare(`SELECT stage FROM player_npc_knowledge WHERE user_id=? AND npc_id=?`).get(userId, npcId);
        const stage = row?.stage || 'met';
        const recent = new Map(database_1.default.prepare(`SELECT line_id,MAX(shown_at) shown_at FROM dialogue_receipts WHERE user_id=? AND npc_id=? GROUP BY line_id`).all(userId, npcId).map(x => [x.line_id, x.shown_at]));
        let pool = (0, NpcCatalog_1.dialogueBySpeaker)(npcId).filter(l => (!ctx.family || l.family === ctx.family) && (!l.locations || l.locations.includes(ctx.location)) && (!l.requiredFacts || l.requiredFacts.every(f => facts.has(f))) && (!l.forbiddenFacts || l.forbiddenFacts.every(f => !facts.has(f))) && (!l.requiredMemoryKeys || l.requiredMemoryKeys.every(f => memoryKeys.has(f))) && (!l.relationshipStages || l.relationshipStages.includes(stage)) && (!l.once || !recent.has(l.id)) && (!l.cooldownSeconds || now - (recent.get(l.id) || 0) >= l.cooldownSeconds * 1000));
        pool.sort((a, b) => (recent.get(a.id) || 0) - (recent.get(b.id) || 0));
        if (!pool.length)
            pool = (0, NpcCatalog_1.dialogueBySpeaker)(npcId).filter(l => (!ctx.family || l.family === ctx.family) && (!l.requiredFacts || l.requiredFacts.every(f => facts.has(f))) && (!l.forbiddenFacts || l.forbiddenFacts.every(f => !facts.has(f))) && (!l.requiredMemoryKeys || l.requiredMemoryKeys.every(f => memoryKeys.has(f))) && (!l.relationshipStages || l.relationshipStages.includes(stage))).sort((a, b) => (recent.get(a.id) || 0) - (recent.get(b.id) || 0));
        const line = pool[0];
        if (!line)
            return { ok: false, message: 'Người ấy đang bận việc trong tay, chưa có điều gì muốn nói lúc này.', line: null };
        const key = ctx.contextKey || ctx.family || 'ambient';
        database_1.default.prepare(`INSERT OR IGNORE INTO dialogue_receipts(user_id,npc_id,line_id,context_hash,shown_at) VALUES(?,?,?,?,?)`).run(userId, npcId, line.id, key, now);
        return { ok: true, message: this.render(line.text, ctx, mem), line };
    }
    acquaintance(userId) { return database_1.default.prepare(`SELECT k.*,p.location_id,p.state FROM player_npc_knowledge k LEFT JOIN npc_presence p ON p.npc_id=k.npc_id WHERE k.user_id=? ORDER BY k.last_met_at DESC`).all(userId); }
}
exports.dialogueService = new DialogueService();
