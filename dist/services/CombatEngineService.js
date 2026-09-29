"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combatEngine = void 0;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../database/database"));
const CombatCatalog_1 = require("../config/CombatCatalog");
const StatsService_1 = require("./StatsService");
const RuntimeKernelService_1 = require("./RuntimeKernelService");
const UserRepository_1 = require("../database/repositories/UserRepository");
const hash = (x) => (0, crypto_1.createHash)('sha256').update(x).digest('hex');
const stable = (seed, seq) => parseInt(hash(`${seed}:${seq}`).slice(0, 12), 16) / 0xffffffffffff;
const pack = (x) => JSON.stringify(x);
function player(uid, side, strategy) { const u = UserRepository_1.userRepository.get(uid), s = StatsService_1.statsService.get(uid); if (!u || !s)
    throw new Error(`PLAYER_NOT_FOUND:${uid}`); const ratio = u.max_hp > 0 ? Math.max(0, Math.min(1, u.hp / u.max_hp)) : 1, hp = Math.max(1, Math.round(s.hp * ratio)); return { id: uid, ownerId: uid, name: u.name, side, hp, maxHp: s.hp, qi: Math.max(0, Math.min(u.mp, u.max_mp)), maxQi: u.max_mp, atk: s.atk, def: s.def, speed: s.speed, strategy, alive: hp > 0, cooldowns: {}, guard: 0 }; }
function enemy(x, side = 2) { return { id: x.id, name: x.name, side, hp: x.hp, maxHp: x.hp, qi: x.qi ?? 100, maxQi: x.qi ?? 100, atk: x.atk, def: x.def, speed: x.speed ?? 90, strategy: 'CAN_BANG', alive: true, cooldowns: {}, guard: 0 }; }
function publicState(fs) { return fs.map(x => ({ id: x.id, side: x.side, hp: x.hp, qi: x.qi, alive: x.alive, guard: x.guard, cooldowns: x.cooldowns })); }
exports.combatEngine = {
    start(input) {
        const old = database_1.default.prepare('SELECT * FROM combat_encounters WHERE source_id=? AND source_run_id=?').get(input.sourceId, input.sourceRunId);
        if (old)
            return { ok: true, replayed: true, encounterId: old.id, state: old.state };
        const rule = CombatCatalog_1.MODE_RULES[input.mode];
        if (!rule)
            throw new Error('COMBAT_MODE_NOT_AUTHORED');
        const ids = [...new Set([...(input.players || []), ...(input.opponents || [])])];
        if (!ids.length)
            throw new Error('EMPTY_ROSTER');
        const id = (0, crypto_1.randomUUID)(), leases = [];
        try {
            for (const uid of ids) {
                const l = RuntimeKernelService_1.runtimeKernel.acquireLease(uid, 'MUTATING_COMBAT_LEASE', id);
                if (!l.ok)
                    throw new Error(l.message);
                leases.push(uid);
            }
            const strategy = input.strategy || 'CAN_BANG', dynamic = input.enemyDefinitionId ? RuntimeKernelService_1.contentResolver.pin(id, input.enemyDefinitionId, 'monster') : null, dynamicEnemies = dynamic ? [{ id: dynamic.id, name: dynamic.data.name, hp: Number(dynamic.data.hp), atk: Number(dynamic.data.atk), def: Number(dynamic.data.def), speed: Number(dynamic.data.speed || 90) }] : [], fighters = [...input.players.map(x => player(x, 1, strategy)), ...(input.opponents || []).map(x => player(x, 2, strategy)), ...(input.enemies || dynamicEnemies).map(x => enemy(x))];
            if (!fighters.some(x => x.side === 2))
                throw new Error('MISSING_OPPOSITION');
            if (fighters.some(x => ![x.hp, x.maxHp, x.atk, x.def, x.speed].every(Number.isFinite) || x.hp <= 0 || x.atk < 0 || x.def < 0))
                throw new Error('INVALID_COMBAT_DEFINITION');
            const seed = input.seed || hash(`${input.sourceId}:${input.sourceRunId}`), t = Date.now(), snapshot = { fighters, resolverVersion: 1, rewardOwner: rule.rewardOwner, strategy };
            database_1.default.transaction(() => { database_1.default.prepare("INSERT INTO combat_encounters(id,world_epoch,mode,source_id,source_run_id,state,persistence,resolver_version,seed,snapshot_json,max_cycles,created_at,locked_at) VALUES(?,?,?,?,?,'LOCKED',?,?,?,?,?,?,?)").run(id, RuntimeKernelService_1.runtimeKernel.epoch(), input.mode, input.sourceId, input.sourceRunId, rule.persistence, 1, seed, pack(snapshot), rule.maxCycles, t, t); const q = database_1.default.prepare('INSERT INTO combat_participants(encounter_id,entity_id,owner_id,side,kind,snapshot_json) VALUES(?,?,?,?,?,?)'); for (const f of fighters)
                q.run(id, f.id, f.ownerId || null, f.side, f.ownerId ? 'PLAYER' : 'ENEMY', pack(f)); })();
            return this.run(id);
        }
        catch (e) {
            for (const uid of leases)
                RuntimeKernelService_1.runtimeKernel.releaseLease(uid, 'MUTATING_COMBAT_LEASE', id);
            throw e;
        }
    },
    run(id) {
        const e = database_1.default.prepare('SELECT * FROM combat_encounters WHERE id=?').get(id);
        if (!e)
            throw new Error('ENCOUNTER_NOT_FOUND');
        if (['SETTLED', 'VICTORY', 'DEFEAT', 'TIMEOUT'].includes(e.state))
            return { ok: true, replayed: true, encounterId: id, state: e.state, result: JSON.parse(e.result_json || '{}') };
        RuntimeKernelService_1.runtimeKernel.assertEpoch(e.world_epoch);
        const snapshot = JSON.parse(e.snapshot_json), fs = snapshot.fighters, events = [];
        let seq = 0, terminal = 'TIMEOUT';
        database_1.default.prepare("UPDATE combat_encounters SET state='RUNNING' WHERE id=? AND state='LOCKED'").run(id);
        for (let cycle = 1; cycle <= e.max_cycles; cycle++) {
            const order = fs.filter(x => x.alive).sort((a, b) => b.speed - a.speed || a.id.localeCompare(b.id));
            for (const actor of order) {
                if (!actor.alive)
                    continue;
                const allies = fs.filter(x => x.alive && x.side === actor.side), targets = fs.filter(x => x.alive && x.side !== actor.side);
                if (!targets.length)
                    break;
                for (const k of Object.keys(actor.cooldowns))
                    actor.cooldowns[k] = Math.max(0, actor.cooldowns[k] - 1);
                const low = allies.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.id.localeCompare(b.id))[0];
                let ability = actor.strategy === 'BAO_TOAN' && low.hp / low.maxHp < .45 && actor.qi >= CombatCatalog_1.ABILITIES.mend.qiCost && !(actor.cooldowns.mend > 0) ? CombatCatalog_1.ABILITIES.mend : actor.hp / actor.maxHp < .35 && actor.qi >= CombatCatalog_1.ABILITIES.guard.qiCost && !(actor.cooldowns.guard > 0) ? CombatCatalog_1.ABILITIES.guard : actor.qi >= CombatCatalog_1.ABILITIES.heavy.qiCost && !(actor.cooldowns.heavy > 0) ? CombatCatalog_1.ABILITIES.heavy : CombatCatalog_1.ABILITIES.basic;
                const target = ability.target === 'ENEMY' ? targets.sort((a, b) => a.hp - b.hp || a.id.localeCompare(b.id))[0] : ability.target === 'ALLY' ? low : actor, inputHash = hash(pack(publicState(fs)));
                actor.qi = Math.max(0, actor.qi - ability.qiCost);
                if (ability.cooldown)
                    actor.cooldowns[ability.id] = ability.cooldown;
                let delta = { qi: -ability.qiCost };
                if (ability.kind === 'DAMAGE') {
                    const variance = .9 + stable(e.seed, seq + 1) * .2, raw = Math.max(1, Math.floor(actor.atk * ability.power * variance - target.def * .42)), amount = Math.max(0, Math.floor(raw * (1 - target.guard)));
                    target.guard = 0;
                    target.hp = Math.max(0, target.hp - amount);
                    target.alive = target.hp > 0;
                    delta = { ...delta, damage: amount, targetHp: target.hp };
                }
                else if (ability.kind === 'HEAL') {
                    const amount = Math.min(target.maxHp - target.hp, Math.floor(actor.atk * ability.power));
                    target.hp += amount;
                    delta = { ...delta, heal: amount, targetHp: target.hp };
                }
                else {
                    actor.guard = Math.max(actor.guard, ability.power);
                    delta = { ...delta, guard: actor.guard };
                }
                seq++;
                events.push({ encounter_id: id, seq, cycle, actor_id: actor.id, target_id: target.id, event_type: ability.kind, action_id: ability.id, delta_json: pack(delta), input_hash: inputHash, output_hash: hash(pack(publicState(fs))), tags_json: '[]' });
            }
            const side1 = fs.some(x => x.alive && x.side === 1), side2 = fs.some(x => x.alive && x.side === 2);
            if (!side1 || !side2) {
                terminal = side1 ? 'VICTORY' : 'DEFEAT';
                break;
            }
        }
        const result = { terminal, cycles: events.at(-1)?.cycle || 0, events: events.length, participants: fs.map(x => ({ id: x.id, side: x.side, hp: x.hp, maxHp: x.maxHp, alive: x.alive })) };
        database_1.default.transaction(() => { const q = database_1.default.prepare('INSERT INTO combat_events(encounter_id,seq,cycle,actor_id,target_id,event_type,action_id,delta_json,input_hash,output_hash,tags_json) VALUES(@encounter_id,@seq,@cycle,@actor_id,@target_id,@event_type,@action_id,@delta_json,@input_hash,@output_hash,@tags_json)'); for (const x of events)
            q.run(x); database_1.default.prepare('UPDATE combat_encounters SET state=?,result_json=? WHERE id=?').run(terminal, pack(result), id); })();
        return { ok: true, replayed: false, encounterId: id, state: terminal, result };
    },
    settle(id, sourceReceiptKey, settler = () => ({})) { const prior = database_1.default.prepare('SELECT * FROM combat_settlements WHERE encounter_id=? AND source_receipt_key=?').get(id, sourceReceiptKey); if (prior)
        return { ok: true, replayed: true, terminal: prior.result, source: JSON.parse(prior.payload_json) }; const e = database_1.default.prepare('SELECT * FROM combat_encounters WHERE id=?').get(id); if (!e || !['VICTORY', 'DEFEAT', 'TIMEOUT', 'RETREAT', 'OBJECTIVE_COMPLETE'].includes(e.state))
        return { ok: false, message: 'COMBAT_NOT_TERMINAL' }; const rr = RuntimeKernelService_1.runtimeKernel.execute(sourceReceiptKey, 'COMBAT', null, 'SETTLE', () => { const result = JSON.parse(e.result_json); const source = settler(result); if (e.persistence === 'PERSISTENT')
        for (const p of result.participants.filter((x) => x.side === 1)) {
            const u = UserRepository_1.userRepository.get(p.id);
            if (u)
                database_1.default.prepare('UPDATE users SET hp=MIN(max_hp,?) WHERE discord_id=?').run(p.hp, p.id);
        } database_1.default.prepare('INSERT INTO combat_settlements(encounter_id,source_receipt_key,result,payload_json,settled_at) VALUES(?,?,?,?,?)').run(id, sourceReceiptKey, result.terminal, pack(source), Date.now()); database_1.default.prepare("UPDATE combat_encounters SET state='SETTLED',settled_at=? WHERE id=?").run(Date.now(), id); for (const p of result.participants)
        if (UserRepository_1.userRepository.get(p.id))
            RuntimeKernelService_1.runtimeKernel.releaseLease(p.id, 'MUTATING_COMBAT_LEASE', id); RuntimeKernelService_1.runtimeKernel.emit('COMBAT_SETTLED', `combat:${id}`, { id, sourceReceiptKey, result: result.terminal }); return { terminal: result.terminal, source }; }); return { ok: true, replayed: rr.replayed, ...rr.value }; },
    replay(id, detail = 'SUMMARY') { const e = database_1.default.prepare('SELECT * FROM combat_encounters WHERE id=?').get(id); if (!e)
        return null; const events = database_1.default.prepare('SELECT * FROM combat_events WHERE encounter_id=? ORDER BY seq').all(id); const result = JSON.parse(e.result_json || '{}'); if (detail === 'SUMMARY')
        return { id, mode: e.mode, state: e.state, result, eventCount: events.length }; if (detail === 'CYCLES')
        return { id, result, cycles: [...new Set(events.map(x => x.cycle))].map(c => ({ cycle: c, events: events.filter(x => x.cycle === c).length })) }; return { id, result, events }; },
    audit(id) { const events = database_1.default.prepare('SELECT * FROM combat_events WHERE encounter_id=? ORDER BY seq').all(id), errors = []; events.forEach((x, i) => { if (x.seq !== i + 1)
        errors.push(`seq gap ${i + 1}`); if (Number(JSON.parse(x.delta_json).damage || 0) < 0)
        errors.push(`negative damage ${x.seq}`); }); const settlements = database_1.default.prepare('SELECT COUNT(*) n FROM combat_settlements WHERE encounter_id=?').get(id).n; if (settlements > 1)
        errors.push('double settlement'); return errors; }
};
