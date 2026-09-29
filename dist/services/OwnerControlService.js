"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerControlService = exports.PAVILIONS = void 0;
const database_1 = __importDefault(require("../database/database"));
const UserRepository_1 = require("../database/repositories/UserRepository");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const GameCatalog_1 = require("../config/GameCatalog");
const config_1 = require("../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
exports.PAVILIONS = { tranhai: 'Trấn Hải Các', nhatpham: 'Nhất Phẩm Các', tuha: 'Tử Hà Các', xichduc: 'Xích Dực Các' };
const PRESERVE = new Set(['items', 'journey_catalog', 'journey_edges', 'dialogue_catalog', 'content_definitions', 'admin_audit', 'owner_settings', 'world_meta', 'world_reset_jobs', 'sqlite_sequence']);
const sha = (s) => (0, crypto_1.createHash)('sha256').update(s).digest('hex');
function audit(owner, action, target, detail) { database_1.default.prepare('INSERT INTO admin_audit(owner_id,action,target_id,detail,created_at) VALUES(?,?,?,?,?)').run(owner, action, target, typeof detail === 'string' ? detail : JSON.stringify(detail), Date.now()); }
function mutableTables() { return database_1.default.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(x => x.name).filter(x => !PRESERVE.has(x)); }
exports.ownerControlService = {
    isTest(uid) { return !!database_1.default.prepare("SELECT 1 FROM users WHERE discord_id=? AND title='TEST_ACCOUNT'").get(uid); },
    maintenanceLocked() { const x = database_1.default.prepare("SELECT value FROM world_meta WHERE key='maintenance'").get(); if (x?.value === '1') {
        const live = database_1.default.prepare("SELECT 1 FROM world_reset_jobs WHERE state='OWNER_CONFIRM_PENDING' AND nonce_expires_at>?").get(Date.now());
        if (!live) {
            database_1.default.prepare("UPDATE world_meta SET value='0',updated_at=? WHERE key='maintenance'").run(Date.now());
            return false;
        }
        return true;
    } return false; },
    bindTest(ownerId, targetId = ownerId) { const old = database_1.default.prepare("SELECT value FROM owner_settings WHERE key='TEST_ACCOUNT_ID'").get(); if (old && old.value !== targetId)
        database_1.default.prepare("UPDATE users SET title='Tán Tu' WHERE discord_id=? AND title='TEST_ACCOUNT'").run(old.value); if (!UserRepository_1.userRepository.get(targetId))
        UserRepository_1.userRepository.create(targetId, 'Thiên Thư Thử Nghiệm'); database_1.default.transaction(() => { database_1.default.prepare("UPDATE users SET title='TEST_ACCOUNT' WHERE discord_id=?").run(targetId); database_1.default.prepare("DELETE FROM test_namespaces WHERE user_id!=?").run(targetId); database_1.default.prepare("INSERT INTO test_namespaces(user_id,state_json,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET state_json=excluded.state_json,updated_at=excluded.updated_at").run(targetId, JSON.stringify({ unlockAll: true, virtualAssets: true, competitive: false, worldEvent: false }), Date.now()); database_1.default.prepare("INSERT INTO owner_settings(key,value,updated_at) VALUES('TEST_ACCOUNT_ID',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").run(targetId, Date.now()); audit(ownerId, 'TEST_BIND', targetId, { namespace: 'test', virtualAssets: true, competitive: false }); })(); return { ok: true, message: `Đã gắn tài khoản thử nghiệm duy nhất: ${targetId}; tài sản thử nghiệm nằm trong namespace ảo.` }; },
    adjustCurrency(owner, target, currency, operation, amount, highRiskApproved = false) { if (currency === 'CPLT' && !highRiskApproved)
        return { ok: false, message: 'HIGH_RISK_APPROVAL_REQUIRED: CPLT phải qua preview và nonce.' }; amount = Math.floor(amount); const u = UserRepository_1.userRepository.get(target), field = currency === 'LT' ? 'coin_ha_pham' : 'knb'; if (!u || !Number.isSafeInteger(amount) || amount < 0)
        return { ok: false, message: 'Tài khoản hoặc số lượng không hợp lệ.' }; const before = Number(u[field]), after = operation === 'GRANT' ? before + amount : operation === 'REVOKE' ? before - amount : amount; if (after < 0)
        return { ok: false, message: 'REJECT_INSUFFICIENT: không thể tạo số dư âm.' }; database_1.default.transaction(() => { database_1.default.prepare(`UPDATE users SET ${field}=? WHERE discord_id=?`).run(after, target); audit(owner, `OWNER_${operation}`, target, { asset: currency, before, after, delta: after - before, highRiskApproved }); })(); return { ok: true, message: `${currency}: ${before.toLocaleString()} → ${after.toLocaleString()} (${after - before >= 0 ? '+' : ''}${(after - before).toLocaleString()}).` }; },
    adjustItem(owner, target, itemId, operation, quantity) { quantity = Math.floor(quantity); const item = GameCatalog_1.ITEMS[itemId]; if (!UserRepository_1.userRepository.get(target) || !item || !Number.isSafeInteger(quantity) || quantity <= 0)
        return { ok: false, message: 'Target, item definition hoặc số lượng không hợp lệ.' }; if (!item.sources.length || !item.uses.length)
        return { ok: false, message: 'Item thiếu source/sink nên bị từ chối.' }; const before = InventoryRepository_1.inventoryRepository.quantity(target, itemId); if (operation === 'REVOKE' && before < quantity)
        return { ok: false, message: 'REJECT_INSUFFICIENT: vật phẩm không đủ để thu hồi.' }; let overflow = 0; database_1.default.transaction(() => { if (operation === 'GRANT')
        overflow = InventoryRepository_1.inventoryRepository.add(target, itemId, quantity).overflow;
    else if (!InventoryRepository_1.inventoryRepository.remove(target, itemId, quantity))
        throw new Error('REJECT_INSUFFICIENT'); audit(owner, `OWNER_${operation}_ITEM`, target, { itemId, quantity, before, after: operation === 'GRANT' ? before + quantity : before - quantity, overflow }); })(); return { ok: true, message: `${item.name}: ${operation === 'GRANT' ? 'đã cấp' : 'đã thu hồi'} ×${quantity}${overflow ? ' · phần tràn vào Tạm Nang' : ''}.` }; },
    announce(ownerId, pavilion, content) { const name = exports.PAVILIONS[pavilion]; if (!name || content.trim().length < 2 || content.length > 1500)
        return { ok: false, message: 'Thông báo hoặc danh nghĩa Các không hợp lệ.' }; database_1.default.prepare('INSERT INTO world_announcements(owner_id,pavilion,content,created_at) VALUES(?,?,?,?)').run(ownerId, name, content.trim(), Date.now()); audit(ownerId, 'ANNOUNCEMENT', 'WORLD', { pavilion: name, content: content.trim() }); return { ok: true, message: `## ${name} · Thiên Hạ Cáo Thị\n${content.trim()}` }; },
    async previewReset(owner) { if (this.maintenanceLocked())
        return { ok: false, message: 'Đã có reset đang chờ xác nhận.' }; const tables = mutableTables(), counts = Object.fromEntries(tables.map(t => [t, database_1.default.prepare(`SELECT COUNT(*) n FROM "${t}"`).get().n])); const id = (0, crypto_1.randomUUID)(), dir = path_1.default.join(path_1.default.dirname(config_1.config.dbPath), 'snapshots'); fs_1.default.mkdirSync(dir, { recursive: true }); const snapshot = path_1.default.join(dir, `world-${id}.sqlite`), now = Date.now(); database_1.default.prepare("INSERT INTO world_reset_jobs(id,owner_id,state,counts_json,created_at,updated_at) VALUES(?,?,'SNAPSHOT_CREATING',?,?,?)").run(id, owner, JSON.stringify(counts), now, now); await database_1.default.backup(snapshot); const bytes = fs_1.default.readFileSync(snapshot), checksum = (0, crypto_1.createHash)('sha256').update(bytes).digest('hex'); if (!bytes.length)
        throw new Error('SNAPSHOT_EMPTY'); const nonce = (0, crypto_1.randomBytes)(8).toString('hex'), expires = Date.now() + 10 * 60_000; database_1.default.transaction(() => { database_1.default.prepare("UPDATE world_reset_jobs SET state='OWNER_CONFIRM_PENDING',snapshot_path=?,snapshot_checksum=?,nonce_hash=?,nonce_expires_at=?,updated_at=? WHERE id=?").run(snapshot, checksum, sha(nonce), expires, Date.now(), id); database_1.default.prepare("UPDATE world_meta SET value='1',updated_at=? WHERE key='maintenance'").run(Date.now()); audit(owner, 'FULL_WORLD_RESET_PREVIEW', 'WORLD', { job: id, checksum, counts, expires }); })(); return { ok: true, id, nonce, expires, checksum, counts, message: 'Snapshot đã kiểm chứng; thiên hạ vào maintenance và chờ xác nhận cuối.' }; },
    confirmReset(owner, id, nonce) { const j = database_1.default.prepare('SELECT * FROM world_reset_jobs WHERE id=? AND owner_id=?').get(id, owner); if (!j || j.state !== 'OWNER_CONFIRM_PENDING' || j.nonce_expires_at < Date.now() || j.nonce_hash !== sha(nonce)) {
        database_1.default.transaction(() => { if (j?.state === 'OWNER_CONFIRM_PENDING')
            database_1.default.prepare("UPDATE world_reset_jobs SET state='CANCELLED',nonce_hash=NULL,error='INVALID_OR_EXPIRED_NONCE',updated_at=? WHERE id=?").run(Date.now(), id); database_1.default.prepare("UPDATE world_meta SET value='0',updated_at=? WHERE key='maintenance'").run(Date.now()); })();
        return { ok: false, message: 'Nonce sai, đã dùng hoặc hết hạn; reset bị hủy.' };
    } const tables = mutableTables(), oldEpoch = Number(database_1.default.prepare("SELECT value FROM world_meta WHERE key='world_epoch'").get()?.value || 1); try {
        database_1.default.transaction(() => { database_1.default.prepare("UPDATE world_reset_jobs SET state='RESETTING',nonce_hash=NULL,updated_at=? WHERE id=?").run(Date.now(), id); database_1.default.pragma('defer_foreign_keys = ON'); for (const t of tables)
            database_1.default.prepare(`DELETE FROM "${t}"`).run(); const remaining = database_1.default.prepare('SELECT COUNT(*) n FROM users').get().n; if (remaining !== 0)
            throw new Error(`VERIFY_USERS_${remaining}`); database_1.default.prepare("UPDATE world_meta SET value=?,updated_at=? WHERE key='world_epoch'").run(String(oldEpoch + 1), Date.now()); database_1.default.prepare("UPDATE world_meta SET value='0',updated_at=? WHERE key='maintenance'").run(Date.now()); database_1.default.prepare("UPDATE world_reset_jobs SET state='COMPLETED',updated_at=? WHERE id=?").run(Date.now(), id); audit(owner, 'FULL_WORLD_RESET', 'WORLD', { job: id, fromEpoch: oldEpoch, toEpoch: oldEpoch + 1, snapshot: j.snapshot_path, checksum: j.snapshot_checksum }); })();
        return { ok: true, message: `FULL_WORLD hoàn tất · epoch ${oldEpoch} → ${oldEpoch + 1}.` };
    }
    catch (e) {
        database_1.default.prepare("UPDATE world_reset_jobs SET state='RESTORED',error=?,updated_at=? WHERE id=?").run(String(e?.message || e), Date.now(), id);
        database_1.default.prepare("UPDATE world_meta SET value='0',updated_at=? WHERE key='maintenance'").run(Date.now());
        audit(owner, 'FULL_WORLD_RESET_ROLLBACK', 'WORLD', { job: id, error: String(e?.message || e) });
        return { ok: false, message: 'Reset thất bại; transaction đã rollback về snapshot logic trước reset.' };
    } }
};
