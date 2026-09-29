"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(process.cwd(), 'data', 'operational-hardening-test.sqlite');
for (const f of [dbPath, dbPath + '-wal', dbPath + '-shm'])
    try {
        fs_1.default.unlinkSync(f);
    }
    catch { }
process.env.DB_PATH = dbPath;
const { initDatabase } = require('./database/database'), db = require('./database/database').default;
const { userRepository } = require('./database/repositories/UserRepository');
const { operationalHardeningService } = require('./services/OperationalHardeningService');
const { partyRuntime } = require('./services/RuntimeSystemsService');
const { SECRET_REALMS } = require('./config/GameCatalog');
const { runEventCycle } = require('./events/ready');
const { onInteraction } = require('./events/interactionCreate');
function ok(v, m) { if (!v)
    throw new Error(m); }
function seed(id) { userRepository.create(id, id); db.prepare('UPDATE users SET level=300,tu_vi=0,exp_needed=10000,stamina=500 WHERE discord_id=?').run(id); }
function interaction(id, uid, customId, restError) { const calls = []; const i = { id, token: 'token', customId, user: { id: uid }, type: 3, replied: false, deferred: false, client: { rest: { post: async (_r, p) => { if (restError)
                throw restError; calls.push(['update', p]); i.replied = true; } } }, isChatInputCommand: () => false, isModalSubmit: () => false, isUserSelectMenu: () => false, isButton: () => true, reply: async (p) => { calls.push(['reply', p]); i.replied = true; }, followUp: async (p) => calls.push(['followUp', p]) }; return { i, calls }; }
async function main() {
    initDatabase();
    const at = Date.now(), a = 'hard-a', b = 'hard-b';
    seed(a);
    seed(b);
    ok(operationalHardeningService.beginInteraction('receipt-1', a, 'test'), 'receipt đầu không được nhận');
    ok(!operationalHardeningService.beginInteraction('receipt-1', a, 'test'), 'receipt trùng vẫn được nhận');
    operationalHardeningService.completeInteraction('receipt-1');
    ok(db.prepare("SELECT status FROM interaction_receipts WHERE interaction_id='receipt-1'").get().status === 'COMPLETED', 'receipt không commit');
    const limits = [1, 2, 3, 4].map(() => operationalHardeningService.allow(a, 'burst', 3, 60_000));
    ok(limits.join(',') === 'true,true,true,false', 'rate limit không khóa đúng ngưỡng');
    const before = userRepository.get(a).stamina, first = interaction('same-click', a, `ttmeditate_${a}`), second = interaction('same-click', a, `ttmeditate_${a}`);
    await onInteraction({ commands: new Map() }, first.i);
    await onInteraction({ commands: new Map() }, second.i);
    ok(userRepository.get(a).stamina < before, 'lần bấm đầu không thực thi');
    ok(JSON.stringify(second.calls).includes('không thực hiện lần thứ hai'), 'double-click không bị từ chối');
    const expired = interaction('expired-click', a, `tthome_${a}`, Object.assign(new Error('Unknown interaction'), { code: 10062 }));
    await onInteraction({ commands: new Map() }, expired.i);
    ok(db.prepare("SELECT status FROM interaction_receipts WHERE interaction_id='expired-click'").get().status === 'FAILED_TERMINAL', 'interaction hết hạn không được đóng terminal');
    const realmId = SECRET_REALMS[0].id;
    db.prepare('INSERT INTO party_lobbies(id,leader_id,realm_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?)').run('stale-party', a, realmId, 'FORMING', at - 4e6, at - 4e6);
    db.prepare('INSERT INTO party_members(party_id,user_id,ready,joined_at) VALUES(?,?,?,?)').run('stale-party', a, 1, at - 4e6);
    db.prepare('INSERT INTO party_invites(party_id,target_id,inviter_id,expires_at) VALUES(?,?,?,?)').run('stale-party', b, a, at - 1);
    db.prepare('INSERT INTO partner_invites(id,sender_id,receiver_id,status,expires_at,created_at) VALUES(?,?,?,?,?,?)').run('partner-old', a, b, 'INVITE_PENDING', at - 1, at - 1000);
    db.prepare('INSERT INTO mentorship_invites(id,mentor_id,disciple_id,status,expires_at,created_at) VALUES(?,?,?,?,?,?)').run('mentor-old', a, b, 'INVITED', at - 1, at - 1000);
    db.prepare("INSERT OR REPLACE INTO npc_presence(npc_id,location_id,state,lease_key,lease_expires_at,updated_at) VALUES('lang_tieu','hoa_chan','leased','npc-old',?,?)").run(at - 1, at - 1000);
    db.prepare("INSERT INTO npc_companion_states(user_id,npc_id,state,activity_id,updated_at) VALUES(?,?,'ACCOMPANYING','old-trip',?)").run(a, 'lang_tieu', at - 1000);
    db.prepare("INSERT INTO npc_activity_leases(lease_key,npc_id,player_id,activity_id,scope,state,expires_at,created_at) VALUES('npc-old','lang_tieu',?,'old-trip','COMPANION','ACTIVE',?,?)").run(a, at - 1, at - 1000);
    db.prepare("INSERT INTO owner_mutations(id,owner_id,target_id,action,payload_json,before_json,nonce_hash,expires_at,status,created_at) VALUES('owner-old',?,?, 'TEST','{}','{}','hash',?,'PENDING',?)").run(a, b, at - 1, at - 1000);
    db.prepare("INSERT INTO world_reset_jobs(id,owner_id,state,counts_json,created_at,updated_at) VALUES('reset-old',?,'SNAPSHOT_CREATING','{}',?,?)").run(a, at - 2e6, at - 2e6);
    db.prepare("UPDATE world_meta SET value='1' WHERE key='maintenance'").run();
    const recovered = operationalHardeningService.recover(at);
    ok(recovered.parties === 1 && recovered.npc === 1 && recovered.owners === 1 && recovered.resets === 1, 'recovery không xử lý đủ state');
    ok(!partyRuntime.current(a), 'thành viên còn mắc trong lobby hết hạn');
    ok(partyRuntime.create(a, realmId).ok, 'người chơi không thể lập đội mới sau recovery');
    ok(db.prepare("SELECT status FROM partner_invites WHERE id='partner-old'").get().status === 'EXPIRED', 'partner invite chưa hết hạn');
    ok(db.prepare("SELECT state FROM npc_companion_states WHERE user_id=? AND npc_id='lang_tieu'").get(a).state === 'RESTING', 'NPC chưa được trả về RESTING');
    ok(db.prepare("SELECT value FROM world_meta WHERE key='maintenance'").get().value === '0', 'maintenance không được mở khóa');
    const cycleAt = Date.now();
    const c1 = runEventCycle(cycleAt), c2 = runEventCycle(cycleAt);
    ok(c1.ran && !c2.ran, 'distributed scheduler lease không chặn chu kỳ trùng');
    console.log('✅ Operational Hardening: receipt/double-click · rate limit · expired interaction · restart recovery · stale lobby release · NPC/Owner/reset recovery · scheduler singleton PASS');
}
main().catch(e => { console.error(e); process.exit(1); });
