"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const dbPath = path_1.default.join(process.cwd(), 'data', 'technical-stress-test.sqlite');
for (const f of [dbPath, dbPath + '-wal', dbPath + '-shm'])
    try {
        fs_1.default.unlinkSync(f);
    }
    catch { }
process.env.DB_PATH = dbPath;
const { initDatabase } = require('./database/database'), db = require('./database/database').default, { userRepository } = require('./database/repositories/UserRepository'), { inventoryRepository } = require('./database/repositories/InventoryRepository');
const { runtimeKernel } = require('./services/RuntimeKernelService'), { combatEngine } = require('./services/CombatEngineService'), { relationshipRuntime, npcCompanionRuntime } = require('./services/RelationshipRuntimeService'), { towerService } = require('./services/TowerService'), { anomalyRuntime } = require('./services/ActivityRuntimeService');
function ok(v, m) { if (!v)
    throw new Error(m); }
function worker() { return new Promise(resolve => { const p = (0, child_process_1.spawn)(process.execPath, [path_1.default.join(__dirname, 'concurrencyWorker.js'), dbPath, 'race:one', 'race'], { stdio: ['ignore', 'pipe', 'pipe'] }), o = [], e = []; p.stdout.on('data', x => o.push(String(x))); p.stderr.on('data', x => e.push(String(x))); p.on('close', code => resolve({ code, out: o.join(''), err: e.join('') })); }); }
async function main() {
    initDatabase();
    for (const id of ['race', 'p1', 'p2', 'p3', 'p4'])
        userRepository.create(id, id);
    db.prepare("UPDATE users SET level=45,max_hp=3500,hp=3500,max_mp=300,mp=300,atk=260,def=150,speed=130,stamina=500,coin_ha_pham=100000 WHERE discord_id IN ('race','p1','p2','p3','p4')").run();
    const before = userRepository.get('race').coin_ha_pham, workers = await Promise.all(Array.from({ length: 16 }, worker));
    ok(workers.every(x => x.code === 0), 'concurrent workers exit');
    ok(userRepository.get('race').coin_ha_pham === before + 1, '16 concurrent deliveries credit once');
    ok(db.prepare("SELECT COUNT(*) n FROM operation_receipts WHERE receipt_key='race:one'").get().n === 1, 'one receipt under concurrency');
    ok(!relationshipRuntime.proposePartner('p1', 'p1').ok, 'self partner exploit');
    ok(!relationshipRuntime.proposePartner('p1', 'p2').ok, 'partner without shared receipt');
    ok(!inventoryRepository.remove('p1', 'pill_0', 1), 'negative inventory exploit');
    let invalid = false;
    try {
        combatEngine.start({ mode: 'PVE', sourceId: 'bad', sourceRunId: '1', players: ['p1'], enemies: [{ id: 'bad', name: 'Bad', hp: -1, atk: -2, def: 0 }] });
    }
    catch {
        invalid = true;
    }
    ok(invalid, 'invalid combat definition rejected');
    const live = combatEngine.start({ mode: 'PVE', sourceId: 'lease', sourceRunId: '1', players: ['p1'], enemies: [{ id: 'x', name: 'X', hp: 999999, atk: 1, def: 9999 }], seed: 'loop' });
    let blocked = false;
    try {
        combatEngine.start({ mode: 'PVE', sourceId: 'lease', sourceRunId: '2', players: ['p1'], enemies: [{ id: 'y', name: 'Y', hp: 1, atk: 1, def: 0 }] });
    }
    catch {
        blocked = true;
    }
    ok(blocked, 'one mutating combat lease');
    combatEngine.settle(live.encounterId, 'lease:settle');
    const tower = towerService.start('p2');
    ok(tower.ok, 'tower run start');
    for (let i = 0; i < 36; i++) {
        const r = towerService.challenge('p2');
        if (!r.ok || r.terminal !== 'VICTORY')
            break;
        db.prepare("UPDATE users SET hp=max_hp,mp=max_mp WHERE discord_id='p2'").run();
    }
    ok(!towerService.audit().length, 'tower receipt consistency');
    const thu = new Date('2026-10-01T12:30:00Z').getTime();
    anomalyRuntime.tick(thu);
    const ar = db.prepare('SELECT id FROM anomaly_runs').get();
    if (ar) {
        anomalyRuntime.act('p3', ar.id);
        anomalyRuntime.act('p3', ar.id);
        anomalyRuntime.act('p3', ar.id);
        const lt = userRepository.get('p3').coin_ha_pham;
        anomalyRuntime.act('p3', ar.id);
        ok(userRepository.get('p3').coin_ha_pham === lt, 'anomaly reward cannot replay');
    }
    const outcomes = { VICTORY: 0, DEFEAT: 0, TIMEOUT: 0 }, start = Date.now();
    for (let i = 0; i < 1000; i++) {
        db.prepare("UPDATE users SET hp=max_hp,mp=max_mp WHERE discord_id='p4'").run();
        const mode = i % 4 === 0 ? 'PVE' : i % 4 === 1 ? 'ELITE' : i % 4 === 2 ? 'BOSS' : 'DUNGEON', enemy = i % 10 === 0 ? { id: `enemy:${i}`, name: 'Soak Overpower', hp: 5000, atk: 100000, def: 100, speed: 999 } : i % 10 === 1 ? { id: `enemy:${i}`, name: 'Soak Stalemate', hp: 1_000_000_000, atk: 0, def: 1_000_000_000, speed: 1 } : { id: `enemy:${i}`, name: 'Soak Enemy', hp: 1400 + (i % 9) * 120, atk: 95 + (i % 7) * 8, def: 55 + (i % 5) * 6, speed: 85 + (i % 11) }, f = combatEngine.start({ mode, sourceId: 'soak', sourceRunId: String(i), players: ['p4'], enemies: [enemy], seed: `soak:${i}` }), terminal = combatEngine.replay(f.encounterId).result.terminal;
        outcomes[terminal] = (outcomes[terminal] || 0) + 1;
        combatEngine.settle(f.encounterId, `soak:settle:${i}`);
        if (combatEngine.audit(f.encounterId).length)
            throw new Error(`ledger corrupt ${i}`);
    }
    const encounters = db.prepare("SELECT COUNT(*) n FROM combat_encounters WHERE source_id='soak'").get().n, settlements = db.prepare("SELECT COUNT(*) n FROM combat_settlements s JOIN combat_encounters e ON e.id=s.encounter_id WHERE e.source_id='soak'").get().n, leases = db.prepare("SELECT COUNT(*) n FROM runtime_leases WHERE state='ACTIVE' AND expires_at>?").get(Date.now()).n;
    ok(encounters === 1000 && settlements === 1000, '1000 soak encounters settled once');
    ok(outcomes.VICTORY > 0 && outcomes.DEFEAT > 0 && outcomes.TIMEOUT > 0, 'all terminal branches covered');
    ok(leases === 0, 'no live lease leak after soak');
    ok(db.prepare('PRAGMA integrity_check').pluck().get() === 'ok', 'sqlite integrity');
    console.log(`✅ Technical stress: concurrency 16/16 · exploit gates PASS · soak 1000 encounters/${Date.now() - start}ms · ${JSON.stringify(outcomes)}`);
}
main().catch(e => { console.error(e); process.exit(1); });
