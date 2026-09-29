"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentResolver = exports.runtimeKernel = void 0;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../database/database"));
const now = () => Date.now();
const epoch = () => Number(database_1.default.prepare("SELECT value FROM world_meta WHERE key='world_epoch'").get()?.value || 1);
/** Transaction/idempotency kernel shared by every mutating runtime domain. */
exports.runtimeKernel = {
    epoch,
    execute(receiptKey, domain, actorId, operation, work) {
        const prior = database_1.default.prepare("SELECT * FROM operation_receipts WHERE receipt_key=? AND status='COMMITTED'").get(receiptKey);
        if (prior)
            return { ok: true, replayed: true, value: JSON.parse(prior.result_json) };
        const worldEpoch = epoch(), t = now();
        let value;
        const tx = database_1.default.transaction(() => {
            const current = database_1.default.prepare('SELECT * FROM operation_receipts WHERE receipt_key=?').get(receiptKey);
            if (current) {
                if (current.world_epoch !== worldEpoch)
                    throw new Error('STALE_WORLD_EPOCH');
                if (current.status === 'COMMITTED') {
                    value = JSON.parse(current.result_json);
                    return;
                }
                throw new Error('OPERATION_IN_PROGRESS');
            }
            database_1.default.prepare("INSERT INTO operation_receipts(receipt_key,world_epoch,domain,actor_id,operation,status,created_at) VALUES(?,?,?,?,?,'PENDING',?)").run(receiptKey, worldEpoch, domain, actorId, operation, t);
            value = work();
            database_1.default.prepare("UPDATE operation_receipts SET status='COMMITTED',result_json=?,committed_at=? WHERE receipt_key=?").run(JSON.stringify(value ?? null), now(), receiptKey);
        });
        tx.immediate();
        const committed = database_1.default.prepare("SELECT result_json FROM operation_receipts WHERE receipt_key=? AND status='COMMITTED'").get(receiptKey);
        return { ok: true, replayed: !!prior, value: committed ? JSON.parse(committed.result_json) : value };
    },
    emit(topic, dedupeKey, payload, availableAt = now()) {
        const id = (0, crypto_1.randomUUID)();
        const r = database_1.default.prepare("INSERT OR IGNORE INTO outbox_events(event_id,world_epoch,topic,dedupe_key,payload_json,available_at,created_at) VALUES(?,?,?,?,?,?,?)").run(id, epoch(), topic, dedupeKey, JSON.stringify(payload), availableAt, now());
        return { eventId: r.changes ? id : database_1.default.prepare('SELECT event_id FROM outbox_events WHERE dedupe_key=?').get(dedupeKey).event_id, created: !!r.changes };
    },
    acquireLease(ownerId, scope, resourceId, ttlMs = 15 * 60_000) {
        const t = now(), leaseKey = `${scope}:${ownerId}`;
        database_1.default.prepare("DELETE FROM runtime_leases WHERE (state='ACTIVE' AND expires_at<=?) OR (lease_key=? AND state!='ACTIVE')").run(t, leaseKey);
        try {
            database_1.default.prepare("INSERT INTO runtime_leases(lease_key,world_epoch,owner_id,scope,resource_id,state,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,'ACTIVE',?,?,?)").run(leaseKey, epoch(), ownerId, scope, resourceId, t + ttlMs, t, t);
            return { ok: true, leaseKey };
        }
        catch {
            return { ok: false, leaseKey, message: 'PLAYER_ALREADY_IN_MUTATING_COMBAT' };
        }
    },
    releaseLease(ownerId, scope, resourceId) { return database_1.default.prepare("UPDATE runtime_leases SET state='RELEASED',updated_at=? WHERE owner_id=? AND scope=? AND resource_id=? AND state='ACTIVE'").run(now(), ownerId, scope, resourceId).changes > 0; },
    assertEpoch(expected) { if (epoch() !== expected)
        throw new Error('STALE_WORLD_EPOCH'); }
};
exports.contentResolver = {
    resolve(definitionId, kind) {
        const row = database_1.default.prepare(`SELECT * FROM content_definitions WHERE definition_id=? AND status='PUBLISHED' ${kind ? 'AND kind=?' : ''} ORDER BY version DESC LIMIT 1`).get(...(kind ? [definitionId, kind] : [definitionId]));
        return row ? { id: row.definition_id, kind: row.kind, version: row.version, data: JSON.parse(row.data_json) } : null;
    },
    pin(runId, definitionId, kind) { const d = this.resolve(definitionId, kind); if (!d)
        throw new Error(`CONTENT_NOT_PUBLISHED:${definitionId}`); database_1.default.prepare('INSERT OR IGNORE INTO content_pins(run_id,definition_id,version,data_json,created_at) VALUES(?,?,?,?,?)').run(runId, d.id, d.version, JSON.stringify(d.data), now()); return d; },
    pinned(runId, definitionId) { const x = database_1.default.prepare('SELECT version,data_json FROM content_pins WHERE run_id=? AND definition_id=?').get(runId, definitionId); return x ? { version: x.version, data: JSON.parse(x.data_json) } : null; },
    audit() { const errors = []; const published = database_1.default.prepare("SELECT * FROM content_definitions WHERE status='PUBLISHED'").all(); for (const r of published) {
        let data;
        try {
            data = JSON.parse(r.data_json);
        }
        catch {
            errors.push(`${r.definition_id}: invalid JSON`);
            continue;
        }
        if (!data.name)
            errors.push(`${r.definition_id}: missing name`);
        const refs = Array.isArray(data.references) ? data.references : [];
        for (const ref of refs)
            if (!database_1.default.prepare("SELECT 1 FROM items WHERE id=? UNION SELECT 1 FROM content_definitions WHERE definition_id=? AND status='PUBLISHED'").get(ref, ref))
                errors.push(`${r.definition_id}: missing reference ${ref}`);
    } return errors; }
};
