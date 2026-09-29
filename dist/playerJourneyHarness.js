"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const dbPath = path_1.default.join(process.cwd(), 'data', 'player-journey-harness.sqlite');
for (const f of [dbPath, dbPath + '-wal', dbPath + '-shm'])
    try {
        fs_1.default.unlinkSync(f);
    }
    catch { }
process.env.DB_PATH = dbPath;
const { initDatabase } = require('./database/database'), db = require('./database/database').default;
const { userRepository } = require('./database/repositories/UserRepository'), { inventoryRepository } = require('./database/repositories/InventoryRepository');
const { ITEMS, LOCATIONS, RECIPES, CPLT_OFFERS } = require('./config/GameCatalog');
const { worldService } = require('./services/WorldService'), { craftingService } = require('./services/CraftingService'), { itemInstanceService } = require('./services/ItemInstanceService');
const { sectRuntime } = require('./services/RuntimeSystemsService'), { dungeonPartyService } = require('./services/DungeonPartyService');
const { dialogueService } = require('./services/DialogueService'), { journeyService } = require('./services/JourneyService');
const { relationshipRuntime, mentorshipRuntime, npcCompanionRuntime } = require('./services/RelationshipRuntimeService');
const { worldEventGameplay } = require('./services/WorldEventGameplayService'), { rankingSeasonService } = require('./services/RankingSeasonService'), { marketService } = require('./services/MarketService');
const { rewardNotificationService } = require('./services/RewardNotificationService');
function ok(v, m) { if (!v)
    throw new Error(m); }
function seed(uid, level = 300) { userRepository.create(uid, uid); db.prepare('UPDATE users SET level=?,tu_vi=0,exp_needed=999999999,hp=12000,max_hp=12000,mp=1200,max_mp=1200,atk=1800,def=900,speed=350,stamina=500,coin_ha_pham=2000000,knb=20 WHERE discord_id=?').run(level, uid); db.prepare("INSERT INTO player_credentials(user_id,credential_id,state,source_ref,granted_at) VALUES(?,'THAT_MON_BAI_THIEP','ACTIVE','HARNESS',?)").run(uid, Date.now()); }
initDatabase();
for (const u of ['main', 'party', 'partner', 'disciple', 'overflow'])
    seed(u);
dialogueService.seedPresence();
// 1. Vân Du → vật phẩm → chế tác → item instance → trang bị.
const loc = LOCATIONS.find((x) => x.minRealm === 0);
const stamina = userRepository.get('main').stamina, trip = worldService.act('main', loc.id);
ok(trip.ok && userRepository.get('main').stamina < stamina, 'Vân Du không tiêu hao/trao thưởng');
ok(db.prepare('SELECT 1 FROM discoveries WHERE user_id=?').get('main'), 'Vân Du không ghi khám phá');
const recipe = RECIPES.find((x) => ITEMS[x.output[0]]?.type === 'weapon' && x.minRealm === 0);
db.prepare("INSERT INTO craft_mastery(user_id,kind,exp,level) VALUES(?,?,120,6)").run('main', recipe.kind);
for (const [id, q] of recipe.ingredients)
    inventoryRepository.add('main', id, q);
const made = craftingService.craft('main', recipe.id, undefined, 0);
ok(made.ok && !made.message.includes('thất bại'), 'Chế tác vũ khí không thành công');
const weapon = db.prepare("SELECT * FROM item_instances WHERE owner_id='main' AND template_id=? ORDER BY created_at DESC LIMIT 1").get(recipe.output[0]);
ok(weapon && itemInstanceService.equip('main', weapon.instance_id).ok, 'Trang bị item instance thất bại');
ok(itemInstanceService.get(weapon.instance_id).equipped_slot === 'weapon', 'Trang bị không lưu slot');
// 2. Gia nhập → tông vụ → ly môn 24 giờ → không thể lách cooldown.
ok(sectRuntime.join('main', 'hoa_chan').ok, 'Không thể gia nhập Thất Đại sau Bái Thiếp');
ok(sectRuntime.activity('main').ok, 'Tông vụ không tăng cống hiến');
ok(sectRuntime.leave('main').ok, 'Ly môn thất bại');
ok(!sectRuntime.join('main', 'phu_do_cung').ok, 'Có thể lách Ly Môn Điều Tức 24 giờ');
// 3. Lobby hai người → ready → ba gian auto-combat → reward + notification.
const party = dungeonPartyService.create('main', 'realm_1');
ok(party.ok && dungeonPartyService.invite('main', 'party').ok && dungeonPartyService.accept('party', party.id).ok, 'Luồng mời/nhận tổ đội thất bại');
ok(dungeonPartyService.ready('party').ok, 'Thành viên không thể sẵn sàng');
const run = dungeonPartyService.start('main');
ok(run.ok, 'Đội đủ ready nhưng không khởi hành');
let complete = false;
for (let room = 0; room < 3; room++) {
    const fight = dungeonPartyService.chooseRoute('main', 'THAN_TRONG');
    ok(fight.ok, 'Đội trưởng không chọn được đường');
    const settled = dungeonPartyService.settleRoom('main');
    ok(settled.ok, 'Gian Bí Cảnh không quyết toán');
    if (!settled.won)
        break;
    complete = settled.complete;
}
ok(complete, 'Tổ đội mạnh hợp lệ không hoàn tất ba gian');
ok(rewardNotificationService.unread('main').some((x) => x.source.startsWith('DUNGEON:')), 'Bí Cảnh không báo thưởng tức thời');
// 4. Cơ Duyên → Vân Du Lục; Cố Nhân Lục → thoại; Đồng Hành NPC.
const jd = journeyService.available('main')[0];
ok(jd, 'Không có Cơ Duyên khả dụng');
let j = journeyService.start('main', jd.id);
for (const action of ['OBSERVE', 'ACT', 'CONFIRM', 'COMMIT']) {
    j = journeyService.choose('main', jd.id, action);
    ok(j.ok, `Cơ Duyên đứt tại ${action}`);
}
ok(db.prepare('SELECT 1 FROM travel_log_entries WHERE user_id=? AND entry_key LIKE ?').get('main', `${jd.id}:%`), 'Cơ Duyên không vào Vân Du Lục');
const talk = dialogueService.resolve('main', 'lang_tieu', { location: 'hoa_chan', family: 'first_meet', contextKey: 'journey-harness' });
ok(talk.ok && talk.line, 'Không thể tạo Cố Nhân Lục/thoại có line_id');
ok(dialogueService.acquaintance('main').some((x) => x.npc_id === 'lang_tieu'), 'Cố Nhân Lục không ghi Lăng Tiêu');
dialogueService.setStage('main', 'lang_tieu', 'close');
db.prepare("UPDATE player_npc_knowledge SET stage='eligible' WHERE user_id='main' AND npc_id='lang_tieu'").run();
const companion = npcCompanionRuntime.invite('main', 'lang_tieu', 'journey:harness');
ok(companion.ok && npcCompanionRuntime.settle('main', 'lang_tieu', 'journey:harness', 'Cùng hoàn tất hành trình kiểm thử.').ok, 'Đồng Hành NPC không hoàn chỉnh');
// 5. Đạo Lữ và Sư Đồ có consent/state/receipt thật.
relationshipRuntime.recordShared('main', 'partner', 'KHAM_PHA', 'shared:harness', 'shared:harness:receipt');
const invite = relationshipRuntime.proposePartner('main', 'partner');
ok(invite.ok && relationshipRuntime.acceptPartner('partner', invite.id).ok, 'Đạo Lữ không qua bước chấp thuận');
relationshipRuntime.confirmPartner('main', invite.id);
ok(relationshipRuntime.confirmPartner('partner', invite.id).ok, 'Đạo Lữ không qua xác nhận song phương');
const dual = relationshipRuntime.proposeDual('main', 30);
relationshipRuntime.confirmDual('main', dual.id);
ok(relationshipRuntime.confirmDual('partner', dual.id).ok, 'Song Tu không quyết toán nguyên tử');
const mentor = mentorshipRuntime.propose('party', 'disciple');
mentorshipRuntime.confirm('party', mentor.id);
ok(mentorshipRuntime.confirm('disciple', mentor.id).ok, 'Sư Đồ không xác nhận song phương');
// 6. World Event → notification → BXH tuần/tháng → CPLT → sink thật.
const wid = (0, crypto_1.randomUUID)(), now = Date.now();
db.prepare("INSERT INTO world_event_runs(id,event_type,scheduled_key,status,starts_at,ends_at,state_json,created_at,updated_at) VALUES(?,'PHA_GIOI',?,'ACTIVE',?,?,'{}',?,?)").run(wid, `HARNESS:${wid}`, now - 1000, now + 3600000, now, now);
ok(worldEventGameplay.breach('main', 'ho_sinh').ok, 'Không thể tham gia Phá Giới');
ok(worldEventGameplay.settle(wid) === 1, 'World Event không quyết toán');
ok(rewardNotificationService.unread('main').some((x) => x.source === `WORLD_EVENT:${wid}`), 'World Event không báo thưởng tức thời');
rankingSeasonService.recordPvp('main', 'party', now);
const keys = rankingSeasonService.keys(now);
ok(rankingSeasonService.board('QUAN_HUNG', now)[0]?.user_id === 'main', 'BXH không ghi điểm PvP');
ok(rankingSeasonService.settle('QUAN_HUNG', keys.week) >= 1, 'BXH tuần không trao CPLT');
const offer = CPLT_OFFERS[0], before = userRepository.get('main').knb;
ok(marketService.buyCplt('main', offer.item).ok && userRepository.get('main').knb === before - offer.price, 'CPLT không có sink đổi vật thật');
// 7. Túi đầy → Tạm Nang → thông báo overflow → claim sau khi giải phóng ô.
const ordinary = Object.values(ITEMS).filter((x) => !['weapon', 'armor', 'storage'].includes(x.type)).slice(0, 12);
for (const x of ordinary)
    inventoryRepository.add('overflow', x.id, inventoryRepository.maxStack(x.id));
const overflowItem = Object.values(ITEMS).find((x) => !ordinary.some(y => y.id === x.id) && !['weapon', 'armor', 'storage'].includes(x.type));
const add = inventoryRepository.add('overflow', overflowItem.id, 1);
ok(add.overflow === 1 && inventoryRepository.temporary('overflow').some((x) => x.item_id === overflowItem.id), 'Túi đầy không chuyển Tạm Nang');
rewardNotificationService.push('overflow', 'HARNESS_REWARD', `Nhận ${overflowItem.name}; vật phẩm đã vào Tạm Nang.`, true);
ok(rewardNotificationService.unread('overflow').some((x) => x.overflow === 1), 'Thông báo không đánh dấu overflow');
inventoryRepository.remove('overflow', ordinary[0].id, inventoryRepository.maxStack(ordinary[0].id));
ok(inventoryRepository.claimTemporary('overflow', overflowItem.id).ok, 'Không claim được sau khi giải phóng ô');
ok(db.pragma('integrity_check')[0].integrity_check === 'ok', 'SQLite integrity hỏng sau full journey');
ok(!db.pragma('foreign_key_check').length, 'Foreign key hỏng sau full journey');
console.log('✅ Player Journey Harness: nhập thế/Vân Du/chế tác/trang bị · Thất Đại/ly môn · tổ đội Bí Cảnh · Cơ Duyên/Cố Nhân/Đồng Hành · Đạo Lữ/Sư Đồ · World Event/BXH/CPLT · Tạm Nang/notification PASS');
