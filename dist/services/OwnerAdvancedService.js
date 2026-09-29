"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerAdvancedService = void 0;
const database_1 = __importDefault(require("../database/database"));
const crypto_1 = require("crypto");
const GameCatalog_1 = require("../config/GameCatalog");
const config_1 = require("../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const hash = (x) => (0, crypto_1.createHash)('sha256').update(x).digest('hex');
const epoch = () => Number(database_1.default.prepare("SELECT value FROM world_meta WHERE key='world_epoch'").get()?.value || 1);
function audit(owner, action, target, detail) { database_1.default.prepare('INSERT INTO admin_audit(owner_id,action,target_id,detail,created_at) VALUES(?,?,?,?,?)').run(owner, action, target, JSON.stringify({ ...detail, worldEpoch: epoch() }), Date.now()); }
exports.ownerAdvancedService = {
    player(uid) { return database_1.default.prepare('SELECT discord_id,name,title,level,tu_vi,exp_needed,linh_can_main,linh_can_grade,competitive_locked,updated_at FROM users WHERE discord_id=?').get(uid); },
    previewPlayer(owner, target, action, value = '', reason = '') { const before = this.player(target); if (!before || reason.trim().length < 3)
        return { ok: false, message: 'Không tìm thấy người chơi hoặc thiếu lý do.' }; let payload = { value, reason: reason.trim(), worldEpoch: epoch() }; if (action === 'SET_TUVI') {
        const n = Number(value);
        if (!Number.isSafeInteger(n) || n < 0)
            return { ok: false, message: 'Tu Vi phải là số nguyên không âm.' };
        payload.value = n;
    }
    else if (action === 'SET_REALM') {
        const r = GameCatalog_1.REALMS.find(x => x.id === value);
        if (!r)
            return { ok: false, message: 'Cảnh giới không hợp lệ.' };
        payload.value = r.id;
        payload.level = r.minLevel;
        payload.cascade = r.minLevel < before.level;
    }
    else
        payload.value = action === 'LOCK_COMPETITIVE' ? 1 : 0; const nonce = (0, crypto_1.randomBytes)(8).toString('hex'), id = (0, crypto_1.randomUUID)(); database_1.default.prepare("INSERT INTO owner_mutations(id,owner_id,target_id,action,payload_json,before_json,nonce_hash,expires_at,status,created_at) VALUES(?,?,?,?,?,?,?,?,'PENDING',?)").run(id, owner, target, action, JSON.stringify(payload), JSON.stringify(before), hash(nonce), Date.now() + 10 * 60_000, Date.now()); return { ok: true, id, nonce, expires: Date.now() + 10 * 60_000, before, payload, message: 'Preview đã tạo; cần xác nhận lần hai.' }; },
    confirmPlayer(owner, id, nonce) { const m = database_1.default.prepare("SELECT * FROM owner_mutations WHERE id=? AND owner_id=? AND status='PENDING'").get(id, owner); if (!m || m.expires_at < Date.now() || m.nonce_hash !== hash(nonce))
        return { ok: false, message: 'Preview/nonce không hợp lệ hoặc đã hết hạn.' }; const before = JSON.parse(m.before_json), current = this.player(m.target_id), p = JSON.parse(m.payload_json); if (!current || current.updated_at !== before.updated_at || p.worldEpoch !== epoch())
        return { ok: false, message: 'STALE_PREVIEW: player state hoặc world epoch đã thay đổi.' }; database_1.default.transaction(() => { if (m.action === 'SET_TUVI')
        database_1.default.prepare('UPDATE users SET tu_vi=?,updated_at=? WHERE discord_id=?').run(p.value, Math.floor(Date.now() / 1000), m.target_id);
    else if (m.action === 'SET_REALM')
        database_1.default.prepare('UPDATE users SET level=?,tu_vi=0,exp_needed=MAX(125,CAST(125*pow(1.12,?-1) AS INTEGER)),updated_at=? WHERE discord_id=?').run(p.level, p.level, Math.floor(Date.now() / 1000), m.target_id);
    else
        database_1.default.prepare('UPDATE users SET competitive_locked=?,updated_at=? WHERE discord_id=?').run(p.value, Math.floor(Date.now() / 1000), m.target_id); database_1.default.prepare("UPDATE owner_mutations SET status='APPLIED',nonce_hash='',applied_at=? WHERE id=?").run(Date.now(), id); audit(owner, m.action, m.target_id, { before, after: this.player(m.target_id), reason: p.reason, mutationId: id, cascade: !!p.cascade }); })(); return { ok: true, message: `${m.action} đã áp dụng và ghi audit.` }; },
    draftContent(owner, definitionId, kind, raw) { if (!/^[a-z0-9_\-]{3,64}$/i.test(definitionId) || !['item', 'monster', 'skill', 'secret_realm', 'shop', 'drop'].includes(kind))
        return { ok: false, message: 'ID hoặc loại content không hợp lệ.' }; let data; try {
        data = JSON.parse(raw);
    }
    catch {
        return { ok: false, message: 'JSON không hợp lệ.' };
    } if (!data || Array.isArray(data) || typeof data !== 'object' || typeof data.name !== 'string')
        return { ok: false, message: 'Definition cần object và trường name.' }; const v = Number(database_1.default.prepare('SELECT MAX(version) v FROM content_definitions WHERE definition_id=?').get(definitionId)?.v || 0) + 1; database_1.default.prepare("INSERT INTO content_definitions(definition_id,kind,version,status,data_json,created_by,created_at) VALUES(?,?,?,'DRAFT',?,?,?)").run(definitionId, kind, v, JSON.stringify(data), owner, Date.now()); audit(owner, 'CONTENT_DRAFT', definitionId, { kind, version: v }); return { ok: true, message: `Đã tạo draft ${definitionId} v${v}.`, version: v }; },
    publishContent(owner, definitionId, version) { const d = database_1.default.prepare("SELECT * FROM content_definitions WHERE definition_id=? AND version=? AND status='DRAFT'").get(definitionId, version); if (!d)
        return { ok: false, message: 'Không tìm thấy draft.' }; const data = JSON.parse(d.data_json), refs = Array.isArray(data.references) ? data.references : [], missing = refs.filter((r) => !GameCatalog_1.ITEMS[r] && !database_1.default.prepare("SELECT 1 FROM content_definitions WHERE definition_id=? AND status='PUBLISHED'").get(r)); if (missing.length)
        return { ok: false, message: `Reference scan thất bại: ${missing.join(', ')}.` }; database_1.default.transaction(() => { database_1.default.prepare("UPDATE content_definitions SET status='RETIRED',retired_at=? WHERE definition_id=? AND status='PUBLISHED'").run(Date.now(), definitionId); database_1.default.prepare("UPDATE content_definitions SET status='PUBLISHED',published_at=? WHERE definition_id=? AND version=?").run(Date.now(), definitionId, version); audit(owner, 'CONTENT_PUBLISH', definitionId, { version, kind: d.kind, refs }); })(); return { ok: true, message: `Đã publish ${definitionId} v${version}; bản publish cũ được retire, không hard-delete.` }; },
    retireContent(owner, definitionId, version) { const r = database_1.default.prepare("UPDATE content_definitions SET status='RETIRED',retired_at=? WHERE definition_id=? AND version=? AND status='PUBLISHED'").run(Date.now(), definitionId, version); if (!r.changes)
        return { ok: false, message: 'Không tìm thấy bản publish có thể retire.' }; audit(owner, 'CONTENT_RETIRE', definitionId, { version }); return { ok: true, message: `Đã retire ${definitionId} v${version}.` }; },
    status() { const tables = database_1.default.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE type='table'").get().n, users = database_1.default.prepare('SELECT COUNT(*) n FROM users').get().n, events = database_1.default.prepare("SELECT COUNT(*) n FROM world_event_runs WHERE status='ACTIVE'").get().n; return { epoch: epoch(), maintenance: database_1.default.prepare("SELECT value FROM world_meta WHERE key='maintenance'").get()?.value === '1', tables, users, events }; },
    async snapshot(owner) { const dir = path_1.default.join(path_1.default.dirname(config_1.config.dbPath), 'snapshots'); fs_1.default.mkdirSync(dir, { recursive: true }); const file = path_1.default.join(dir, `manual-${Date.now()}.sqlite`); await database_1.default.backup(file); const checksum = (0, crypto_1.createHash)('sha256').update(fs_1.default.readFileSync(file)).digest('hex'); audit(owner, 'SYSTEM_SNAPSHOT', 'WORLD', { file, checksum }); return { ok: true, file, checksum, message: `Snapshot hệ thống hoàn tất · ${checksum.slice(0, 16)}…` }; },
    repairScalar(owner, target, field, value, reason, provenance, key) { if (!Number.isSafeInteger(value) || value < 0 || reason.length < 3 || provenance.length < 3 || key.length < 8)
        return { ok: false, message: 'Repair thiếu value/reason/provenance/idempotency key hợp lệ.' }; const old = database_1.default.prepare(`SELECT ${field} value FROM users WHERE discord_id=?`).get(target); if (!old)
        return { ok: false, message: 'Không tìm thấy người chơi.' }; if (database_1.default.prepare('SELECT 1 FROM system_repairs WHERE idempotency_key=?').get(key))
        return { ok: true, message: 'Idempotency receipt đã tồn tại; không áp dụng lần hai.' }; database_1.default.transaction(() => { database_1.default.prepare(`UPDATE users SET ${field}=? WHERE discord_id=?`).run(value, target); database_1.default.prepare('INSERT INTO system_repairs(idempotency_key,owner_id,target_id,reason,provenance,before_json,delta_json,after_json,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(key, owner, target, reason, provenance, JSON.stringify({ [field]: old.value }), JSON.stringify({ [field]: value - old.value }), JSON.stringify({ [field]: value }), Date.now()); audit(owner, 'OWNER_REPAIR', target, { field, before: old.value, after: value, delta: value - old.value, reason, provenance, idempotencyKey: key }); })(); return { ok: true, message: `Repair ${field}: ${old.value} → ${value}.` }; }
};
