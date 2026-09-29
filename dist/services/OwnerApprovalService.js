"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerApprovalService = void 0;
const database_1 = __importDefault(require("../database/database"));
const crypto_1 = require("crypto");
const OwnerControlService_1 = require("./OwnerControlService");
const OwnerAdvancedService_1 = require("./OwnerAdvancedService");
const hash = (x) => (0, crypto_1.createHash)('sha256').update(x).digest('hex');
const epoch = () => Number(database_1.default.prepare("SELECT value FROM world_meta WHERE key='world_epoch'").get()?.value || 1);
function create(owner, target, action, payload, before) { const id = (0, crypto_1.randomUUID)(), nonce = (0, crypto_1.randomBytes)(8).toString('hex'), expires = Date.now() + 10 * 60_000; payload.worldEpoch = epoch(); database_1.default.prepare("INSERT INTO owner_mutations(id,owner_id,target_id,action,payload_json,before_json,nonce_hash,expires_at,status,created_at) VALUES(?,?,?,?,?,?,?,?,'PENDING',?)").run(id, owner, target, action, JSON.stringify(payload), JSON.stringify(before), hash(nonce), expires, Date.now()); return { ok: true, id, nonce, expires, action, before, payload, message: 'High-risk preview đã tạo; cần nonce xác nhận lần hai.' }; }
exports.ownerApprovalService = {
    previewCplt(owner, target, operation, amount) { const u = database_1.default.prepare('SELECT discord_id,name,knb,updated_at FROM users WHERE discord_id=?').get(target); if (!u || !Number.isSafeInteger(amount) || amount < 0)
        return { ok: false, message: 'Target hoặc CPLT không hợp lệ.' }; const after = operation === 'GRANT' ? u.knb + amount : operation === 'REVOKE' ? u.knb - amount : amount; if (after < 0)
        return { ok: false, message: 'REJECT_INSUFFICIENT.' }; return create(owner, target, `CPLT_${operation}`, { operation, amount, expected: u.knb, after }, { ...u }); },
    previewContent(owner, id, version, operation) { const d = database_1.default.prepare('SELECT definition_id,kind,version,status,data_json FROM content_definitions WHERE definition_id=? AND version=?').get(id, version); if (!d)
        return { ok: false, message: 'Không tìm thấy content version.' }; if (operation === 'PUBLISH' && d.status !== 'DRAFT' || operation === 'RETIRE' && d.status !== 'PUBLISHED')
        return { ok: false, message: 'Content state không hợp lệ cho thao tác.' }; return create(owner, id, `CONTENT_${operation}`, { operation, version, expectedStatus: d.status }, { name: id, ...d }); },
    previewRepair(owner, target, field, value, reason, provenance, key) { if (!['hp', 'stamina', 'tu_vi'].includes(field) || !Number.isSafeInteger(value) || value < 0 || reason.length < 3 || provenance.length < 3 || key.length < 8)
        return { ok: false, message: 'Repair payload không hợp lệ.' }; const u = database_1.default.prepare(`SELECT discord_id,name,${field} value,updated_at FROM users WHERE discord_id=?`).get(target); if (!u)
        return { ok: false, message: 'Không tìm thấy người chơi.' }; if (database_1.default.prepare('SELECT 1 FROM system_repairs WHERE idempotency_key=?').get(key))
        return { ok: false, message: 'Idempotency key đã được dùng.' }; return create(owner, target, 'SYSTEM_REPAIR', { field, value, reason, provenance, key, expected: u.value }, { ...u }); },
    confirm(owner, id, nonce) { const m = database_1.default.prepare("SELECT * FROM owner_mutations WHERE id=? AND owner_id=? AND status='PENDING'").get(id, owner); if (!m || m.expires_at < Date.now() || m.nonce_hash !== hash(nonce))
        return { ok: false, message: 'Nonce sai, đã dùng hoặc hết hạn.' }; const p = JSON.parse(m.payload_json); if (p.worldEpoch !== epoch())
        return { ok: false, message: 'STALE_PREVIEW: world_epoch đã thay đổi.' }; let r; if (m.action.startsWith('CPLT_')) {
        const u = database_1.default.prepare('SELECT knb FROM users WHERE discord_id=?').get(m.target_id);
        if (!u || u.knb !== p.expected)
            return { ok: false, message: 'STALE_PREVIEW: số dư CPLT đã thay đổi.' };
        r = OwnerControlService_1.ownerControlService.adjustCurrency(owner, m.target_id, 'CPLT', p.operation, p.amount, true);
    }
    else if (m.action.startsWith('CONTENT_')) {
        const d = database_1.default.prepare('SELECT status FROM content_definitions WHERE definition_id=? AND version=?').get(m.target_id, p.version);
        if (!d || d.status !== p.expectedStatus)
            return { ok: false, message: 'STALE_PREVIEW: content state đã thay đổi.' };
        r = p.operation === 'PUBLISH' ? OwnerAdvancedService_1.ownerAdvancedService.publishContent(owner, m.target_id, p.version) : OwnerAdvancedService_1.ownerAdvancedService.retireContent(owner, m.target_id, p.version);
    }
    else if (m.action === 'SYSTEM_REPAIR') {
        const u = database_1.default.prepare(`SELECT ${p.field} value FROM users WHERE discord_id=?`).get(m.target_id);
        if (!u || u.value !== p.expected)
            return { ok: false, message: 'STALE_PREVIEW: target state đã thay đổi.' };
        r = OwnerAdvancedService_1.ownerAdvancedService.repairScalar(owner, m.target_id, p.field, p.value, p.reason, p.provenance, p.key);
    }
    else
        return { ok: false, message: 'Action high-risk không được hỗ trợ.' }; if (!r.ok)
        return r; database_1.default.prepare("UPDATE owner_mutations SET status='APPLIED',nonce_hash='',applied_at=? WHERE id=?").run(Date.now(), id); return { ok: true, message: r.message }; },
    rejectExpired() { return database_1.default.prepare("UPDATE owner_mutations SET status='EXPIRED',nonce_hash='' WHERE status='PENDING' AND expires_at<=?").run(Date.now()).changes; }
};
