"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(process.cwd(), 'data', 'storage-test.sqlite');
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
const { inventoryRepository } = require('./database/repositories/InventoryRepository');
const { storageService } = require('./services/StorageService');
const { marketService } = require('./services/MarketService');
const { ITEMS } = require('./config/GameCatalog');
function ok(v, m) { if (!v)
    throw new Error(m); }
initDatabase();
userRepository.create('store-user', 'Thử Nang');
let active = storageService.active('store-user');
ok(active.item_id === 'bag_hanh_nang' && active.capacity === 12, 'starter Hành Nang 12');
const ordinary = Object.values(ITEMS).filter((x) => x.type === 'material' && x.tradable).slice(0, 13);
for (const x of ordinary.slice(0, 12))
    ok(inventoryRepository.add('store-user', x.id, 1).stored === 1, `fill ${x.id}`);
const overflow = inventoryRepository.add('store-user', ordinary[12].id, 1);
ok(overflow.overflow === 1 && overflow.destination === 'temporary', 'full bag routes to temporary');
ok(inventoryRepository.usedSlots('store-user') === 12, 'capacity respected');
ok(inventoryRepository.add('store-user', ordinary[0].id, 20).overflow === 0, 'existing stack does not consume new slot');
ok(!inventoryRepository.claimTemporary('store-user', ordinary[12].id).ok, 'cannot claim while full');
inventoryRepository.remove('store-user', ordinary[11].id, 1);
ok(inventoryRepository.claimTemporary('store-user', ordinary[12].id).ok, 'claim after freeing slot');
inventoryRepository.add('store-user', 'SEED-XICH-DIEP', 1);
db.prepare('UPDATE temporary_storage SET expires_at=0 WHERE user_id=? AND item_id=?').run('store-user', 'SEED-XICH-DIEP');
inventoryRepository.sweepTemporary('store-user');
ok(db.prepare('SELECT quantity FROM vault_inventory WHERE user_id=? AND item_id=?').get('store-user', 'SEED-XICH-DIEP')?.quantity === 1, 'protected overflow moves to vault on expiry');
userRepository.create('craft-user', 'Luyện Nang');
db.prepare('UPDATE users SET coin_ha_pham=1000000,level=100 WHERE discord_id=?').run('craft-user');
for (const [id, q] of [['thanh_van_thiet', 20], ['bich_linh_ngoc', 10], ['thanh_linh_thao', 10], ['huyen_ngan', 20], ['van_van_ngoc', 10], ['huyet_nguyen_sam', 10]])
    inventoryRepository.add('craft-user', id, q);
ok(!storageService.craft('craft-user', 'storage_bag_1', 0).ok, 'unknown recipe blocked');
ok(storageService.learn('craft-user', 'storage_bag_1').ok, 'learn Khai Nang from Tử Hà');
ok(storageService.craft('craft-user', 'storage_bag_1', 0).ok, 'Khai Nang success');
let pham = storageService.bags('craft-user').find((x) => x.item_id === 'bag_can_khon_pham');
ok(!!pham && !pham.equipped, 'crafted bag starts unequipped');
ok(storageService.switchBag('craft-user', pham.id).ok, 'equip crafted bag');
storageService.addMastery('craft-user', 1);
ok(storageService.learn('craft-user', 'storage_bag_2').ok, 'learn Linh chapter');
ok(!storageService.craft('craft-user', 'storage_bag_2', 0).ok, 'equipped bag cannot be phôi');
ok(storageService.craft('craft-user', 'storage_bag_1', 0).ok, 'create spare phôi');
const spare = storageService.bags('craft-user').find((x) => x.item_id === 'bag_can_khon_pham' && !x.equipped);
ok(storageService.craft('craft-user', 'storage_bag_2', 0).ok, 'adjacent upgrade success');
ok(!db.prepare('SELECT 1 FROM storage_bags WHERE id=?').get(spare.id), 'successful upgrade consumes phôi');
ok(storageService.bags('craft-user').some((x) => x.item_id === 'bag_can_khon_linh'), 'Linh bag created');
for (const [id, q] of [['thanh_van_thiet', 4], ['bich_linh_ngoc', 2], ['thanh_linh_thao', 2]])
    inventoryRepository.add('craft-user', id, q);
ok(storageService.craft('craft-user', 'storage_bag_1', 0).ok, 'failure setup phôi');
const failPhoi = storageService.bags('craft-user').find((x) => x.item_id === 'bag_can_khon_pham' && !x.equipped);
for (const [id, q] of [['huyen_ngan', 6], ['van_van_ngoc', 3], ['huyet_nguyen_sam', 3]])
    inventoryRepository.add('craft-user', id, q);
ok(!storageService.craft('craft-user', 'storage_bag_2', .99).ok, 'forced failure');
ok(!db.prepare('SELECT 1 FROM storage_bags WHERE id=?').get(failPhoi.id), 'failure destroys only spare phôi');
ok(db.prepare('SELECT COUNT(*) n FROM storage_bags WHERE user_id=? AND equipped=1').get('craft-user').n === 1, 'exactly one equipped bag');
ok(storageService.active('craft-user').id === pham.id, 'active bag survives failure');
ok(db.prepare('SELECT COUNT(*) n FROM inventories WHERE user_id=? AND item_id LIKE ?').get('craft-user', 'bag_%').n === 0, 'no nested storage item');
userRepository.create('legacy-user', 'Dữ Liệu Cũ');
for (const x of ordinary)
    db.prepare('INSERT INTO inventories(user_id,item_id,quantity) VALUES(?,?,1)').run('legacy-user', x.id);
active = storageService.active('legacy-user');
ok(active.capacity === 13, 'legacy inventory migration is non-destructive');
userRepository.create('unlocker', 'Người Học Phương');
db.prepare('UPDATE users SET level=300,knb=50 WHERE discord_id=?').run('unlocker');
db.prepare("INSERT INTO craft_mastery(user_id,kind,exp,level) VALUES('unlocker','forging',30,4)").run();
inventoryRepository.add('unlocker', 'tranhai_lenh', 12);
db.prepare("INSERT INTO secret_realm_log(user_id,realm_id,last_entered,clears) VALUES('unlocker','realm_4',0,3)").run();
for (const id of ['boss_huyet_lang', 'boss_kim_giac', 'boss_anh_ma'])
    db.prepare('INSERT INTO boss_damage(boss_id,user_id,damage) VALUES(?,?,1)').run(id, 'unlocker');
ok(storageService.learn('unlocker', 'storage_bag_3').ok, 'Huyền chapter from Trấn Hải');
ok(storageService.learn('unlocker', 'storage_bag_4').ok, 'Địa chapter from Bí Cảnh');
ok(storageService.learn('unlocker', 'storage_bag_5').ok, 'Thiên chapter from Xích Dực');
ok(inventoryRepository.quantity('unlocker', 'tranhai_lenh') === 0 && userRepository.get('unlocker').knb === 0, 'unlock costs are exact sinks');
ok(db.prepare('SELECT COUNT(*) n FROM recipe_knowledge WHERE user_id=?').get('unlocker').n === 3, 'high chapters persisted as Knowledge');
userRepository.create('seller', 'Người Bán');
userRepository.create('buyer', 'Người Mua');
inventoryRepository.add('seller', 'thanh_linh_thao', 6);
ok(marketService.create('seller', 'thanh_linh_thao', 5, 100).ok, 'daily trade first five');
ok(!marketService.create('seller', 'thanh_linh_thao', 1, 20).ok, 'daily trade sixth blocked');
const listing = db.prepare("SELECT id FROM market_listings WHERE seller_id='seller' AND status='active'").get();
ok(marketService.buy('buyer', listing.id).ok, 'market purchase');
ok(userRepository.get('seller').coin_ha_pham === 195, 'exact 5% transaction fee');
console.log('✅ Túi Càn Khôn runtime: 5 phẩm · 12/20/36/56/80/120 ô · overflow/Tạm Nang/Tàng Khố · success/failure/phôi/switch/migration PASS');
