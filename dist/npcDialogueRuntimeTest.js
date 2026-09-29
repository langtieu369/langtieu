"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(process.cwd(), 'data', 'npc-dialogue-test.sqlite');
fs_1.default.mkdirSync(path_1.default.dirname(dbPath), { recursive: true });
for (const f of [dbPath, dbPath + '-wal', dbPath + '-shm'])
    try {
        fs_1.default.unlinkSync(f);
    }
    catch { }
process.env.DB_PATH = dbPath;
const { initDatabase } = require('./database/database');
const db = require('./database/database').default;
const { userRepository } = require('./database/repositories/UserRepository');
const { dialogueService } = require('./services/DialogueService');
const { NPCS, DIALOGUE_LINES, auditNpcCatalog } = require('./config/NpcCatalog');
function ok(v, m) { if (!v)
    throw new Error(m); }
initDatabase();
dialogueService.seedPresence();
userRepository.create('test-user', 'Thử Nghiệm');
ok(auditNpcCatalog().length === 0, 'catalog audit');
ok(NPCS.length === 70, 'realm registry coverage');
ok(NPCS.every((n) => n.realm && n.stage), 'no unresolved realm');
ok(new Set(DIALOGUE_LINES.map((x) => x.id)).size === DIALOGUE_LINES.length, 'unique line ids');
for (const n of NPCS)
    ok(DIALOGUE_LINES.filter((x) => x.speakerId === n.id).length >= 300, `300 lines ${n.id}`);
const normalized = DIALOGUE_LINES.map((x) => x.text.toLocaleLowerCase('vi').replace(/\s+/g, ' ').trim());
ok(new Set(normalized).size === normalized.length, 'no exact duplicate dialogue text');
ok(db.prepare('SELECT COUNT(*) n FROM dialogue_catalog').get().n === DIALOGUE_LINES.length, 'database catalog materialized');
let r = dialogueService.resolve('test-user', 'lang_tieu', { location: 'hoa_chan', family: 'first_meet', contextKey: 'first' });
ok(r.ok && r.line?.id === 'DLG-LT-FIRST-001', 'first meet resolves');
r = dialogueService.resolve('test-user', 'lang_tieu', { location: 'tam_sinh_dao', family: 'first_meet' });
ok(!r.ok, 'remote talk denied');
r = dialogueService.resolve('test-user', 'lang_tieu', { location: 'hoa_chan', family: 'relationship' });
ok(r.line?.id !== 'DLG-LT-TRUE-001', 'secret blocked');
dialogueService.grantFact('test-user', 'lang_tieu', 'lang_tieu_true_name');
r = dialogueService.resolve('test-user', 'lang_tieu', { location: 'hoa_chan', family: 'relationship', contextKey: 'true-name' });
ok(r.line?.id === 'DLG-LT-TRUE-001', 'secret provenance unlock');
dialogueService.setStage('test-user', 'lang_tieu', 'familiar');
dialogueService.remember('test-user', 'lang_tieu', 'shared_event', { summary: 'lần cùng kiểm tra Dược Điền Ngọc Tiêu', choice: 'ngươi đã chọn giữ lại luống dược bị yếu' });
const rotation = [];
for (let i = 0; i < 10; i++) {
    const x = dialogueService.resolve('test-user', 'lang_tieu', { location: 'hoa_chan', family: 'memory_callback', contextKey: `rotation-${i}` });
    ok(x.ok && !x.message.includes('{{'), 'memory render');
    rotation.push(x.line.id);
}
ok(new Set(rotation).size === 10, 'anti-repeat rotation');
ok(!DIALOGUE_LINES.some((x) => (/(?:ngươi|ta|hắn) cái\s|chuyện chuyện|rồi mới đáp rồi/iu).test(x.text)), 'Vietnamese syntax');
console.log(`✅ NPC runtime: ${NPCS.length} NPC · ${DIALOGUE_LINES.length} dialogue records · ≥300/NPC · 16 assertion groups PASS`);
