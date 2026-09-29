"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const p = path_1.default.join(process.cwd(), 'data', 'owner-advanced-test.sqlite');
for (const f of [p, p + '-wal', p + '-shm'])
    try {
        fs_1.default.unlinkSync(f);
    }
    catch { }
process.env.DB_PATH = p;
const { initDatabase } = require('./database/database'), db = require('./database/database').default, { userRepository } = require('./database/repositories/UserRepository'), { ownerAdvancedService } = require('./services/OwnerAdvancedService'), { ownerApprovalService } = require('./services/OwnerApprovalService');
function ok(x, m) { if (!x)
    throw new Error(m); }
async function main() {
    initDatabase();
    userRepository.create('p', 'Player');
    const a = ownerAdvancedService.previewPlayer('owner', 'p', 'SET_TUVI', '500', 'incident fix');
    ok(a.ok && userRepository.get('p').tu_vi === 0, 'player preview no mutation');
    ok(ownerAdvancedService.confirmPlayer('owner', a.id, a.nonce).ok && userRepository.get('p').tu_vi === 500, 'player confirm');
    ok(!ownerAdvancedService.confirmPlayer('owner', a.id, a.nonce).ok, 'player nonce one-time');
    const lock = ownerAdvancedService.previewPlayer('owner', 'p', 'LOCK_COMPETITIVE', '1', 'investigation');
    ok(ownerAdvancedService.confirmPlayer('owner', lock.id, lock.nonce).ok && userRepository.get('p').competitive_locked === 1, 'competitive lock');
    const draft = ownerAdvancedService.draftContent('owner', 'test_item', 'item', JSON.stringify({ name: 'Test Item', references: [] }));
    ok(draft.ok && ownerAdvancedService.publishContent('owner', 'test_item', draft.version).ok, 'content draft publish');
    ok(!ownerAdvancedService.publishContent('owner', 'test_item', draft.version).ok, 'published immutable');
    ok(ownerAdvancedService.retireContent('owner', 'test_item', draft.version).ok, 'content retire');
    const bad = ownerAdvancedService.draftContent('owner', 'bad_ref', 'item', JSON.stringify({ name: 'Bad', references: ['missing_definition'] }));
    ok(bad.ok && !ownerAdvancedService.publishContent('owner', 'bad_ref', bad.version).ok, 'reference scan');
    const cp = ownerApprovalService.previewCplt('owner', 'p', 'GRANT', 7);
    ok(cp.ok && userRepository.get('p').knb === 0, 'CPLT preview no mutation');
    ok(ownerApprovalService.confirm('owner', cp.id, cp.nonce).ok && userRepository.get('p').knb === 7, 'CPLT nonce confirm');
    ok(!ownerApprovalService.confirm('owner', cp.id, cp.nonce).ok, 'CPLT replay blocked');
    const stale = ownerApprovalService.previewCplt('owner', 'p', 'SET', 20);
    db.prepare('UPDATE users SET knb=8 WHERE discord_id=?').run('p');
    ok(!ownerApprovalService.confirm('owner', stale.id, stale.nonce).ok && userRepository.get('p').knb === 8, 'CPLT stale preview blocked');
    const shop = ownerAdvancedService.draftContent('owner', 'shop_patch', 'shop', JSON.stringify({ name: 'Shop Patch', references: [] })), pub = ownerApprovalService.previewContent('owner', 'shop_patch', shop.version, 'PUBLISH');
    ok(pub.ok && ownerApprovalService.confirm('owner', pub.id, pub.nonce).ok, 'shop publish second confirmation');
    ok(!ownerApprovalService.confirm('owner', pub.id, pub.nonce).ok, 'content nonce replay blocked');
    const rep = ownerApprovalService.previewRepair('owner', 'p', 'hp', 77, 'incident repair', 'receipt-42', 'repair-key-001');
    ok(rep.ok && userRepository.get('p').hp === 100, 'repair preview no mutation');
    ok(ownerApprovalService.confirm('owner', rep.id, rep.nonce).ok && userRepository.get('p').hp === 77, 'repair nonce confirm');
    ok(!ownerApprovalService.confirm('owner', rep.id, rep.nonce).ok, 'repair replay blocked');
    const snap = await ownerAdvancedService.snapshot('owner');
    ok(snap.ok && fs_1.default.existsSync(snap.file), 'manual snapshot');
    console.log('✅ Owner advanced runtime: previews/nonces/stale/replay/content/repair/snapshot PASS');
}
main().catch(e => { console.error(e); process.exit(1); });
