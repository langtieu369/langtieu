"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRepository = exports.InventoryRepository = void 0;
const database_1 = __importDefault(require("../database"));
const GameCatalog_1 = require("../../config/GameCatalog");
const now = () => Date.now();
class InventoryRepository {
    maxStack(item) { const i = GameCatalog_1.ITEMS[item]; if (!i)
        return 1; if (i.type === 'weapon' || i.type === 'armor' || i.type === 'storage')
        return 1; if (i.type === 'pill' || i.type === 'food' || i.type === 'special')
        return 99; return 999; }
    ensureStorage(uid) { let bag = database_1.default.prepare('SELECT * FROM storage_bags WHERE user_id=? AND equipped=1').get(uid); if (bag)
        return bag; if (!database_1.default.prepare('SELECT 1 FROM users WHERE discord_id=?').get(uid))
        return null; const legacySlots = this.usedSlots(uid), base = GameCatalog_1.STORAGE_TIERS[0]; database_1.default.prepare('INSERT INTO storage_bags(user_id,item_id,tier,capacity,equipped,created_at) VALUES(?,?,?,?,1,?)').run(uid, base.itemId, base.tier, Math.max(base.capacity, legacySlots), now()); return database_1.default.prepare('SELECT * FROM storage_bags WHERE user_id=? AND equipped=1').get(uid); }
    usedSlots(uid) { let n = 0; for (const r of database_1.default.prepare('SELECT item_id,quantity FROM inventories WHERE user_id=? AND quantity>0').all(uid))
        n += Math.ceil(r.quantity / this.maxStack(r.item_id)); const table = database_1.default.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='item_instances'").get(); if (table)
        n += database_1.default.prepare("SELECT COUNT(*) n FROM item_instances WHERE owner_id=? AND location='INVENTORY' AND state!='DESTROYED'").get(uid).n; return n; }
    capacity(uid) { return Number(this.ensureStorage(uid)?.capacity || 0); }
    freeSlots(uid) { return Math.max(0, this.capacity(uid) - this.usedSlots(uid)); }
    add(uid, item, q = 1) { if (q <= 0 || !GameCatalog_1.ITEMS[item])
        return { stored: 0, overflow: Math.max(0, q), destination: 'rejected' }; if (GameCatalog_1.ITEMS[item].type === 'storage')
        return { stored: 0, overflow: q, destination: 'rejected' }; this.ensureStorage(uid); const have = this.quantity(uid, item), stack = this.maxStack(item), roomInLast = have % stack ? stack - have % stack : 0, room = roomInLast + this.freeSlots(uid) * stack, stored = Math.min(q, room), overflow = q - stored; if (stored > 0)
        database_1.default.prepare(`INSERT INTO inventories(user_id,item_id,quantity) VALUES(?,?,?) ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+excluded.quantity`).run(uid, item, stored); if (overflow > 0)
        this.addTemporary(uid, item, overflow); return { stored, overflow, destination: overflow ? 'temporary' : 'inventory' }; }
    addTemporary(uid, item, q) { const protectedItem = !GameCatalog_1.ITEMS[item].tradable; database_1.default.prepare(`INSERT INTO temporary_storage(user_id,item_id,quantity,protected,expires_at,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+excluded.quantity,protected=MAX(protected,excluded.protected),expires_at=MAX(expires_at,excluded.expires_at)`).run(uid, item, q, protectedItem ? 1 : 0, now() + 86_400_000, now()); }
    sweepTemporary(uid) { const rows = (uid ? database_1.default.prepare('SELECT * FROM temporary_storage WHERE user_id=? AND expires_at<=?').all(uid, now()) : database_1.default.prepare('SELECT * FROM temporary_storage WHERE expires_at<=?').all(now())); database_1.default.transaction(() => { for (const r of rows) {
        if (r.protected)
            database_1.default.prepare(`INSERT INTO vault_inventory(user_id,item_id,quantity,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+excluded.quantity,updated_at=excluded.updated_at`).run(r.user_id, r.item_id, r.quantity, now());
        database_1.default.prepare('DELETE FROM temporary_storage WHERE user_id=? AND item_id=?').run(r.user_id, r.item_id);
    } })(); return rows.length; }
    temporary(uid) { this.sweepTemporary(uid); return database_1.default.prepare('SELECT t.*,i.name,i.emoji FROM temporary_storage t JOIN items i ON i.id=t.item_id WHERE t.user_id=? ORDER BY t.expires_at').all(uid); }
    vault(uid) { return database_1.default.prepare('SELECT v.*,i.name,i.emoji FROM vault_inventory v JOIN items i ON i.id=v.item_id WHERE v.user_id=? ORDER BY i.name').all(uid); }
    claimTemporary(uid, item) { this.sweepTemporary(uid); const r = database_1.default.prepare('SELECT quantity FROM temporary_storage WHERE user_id=? AND item_id=?').get(uid, item); if (!r)
        return { ok: false, message: 'Tạm Nang không có vật phẩm này.' }; const before = this.quantity(uid, item), stack = this.maxStack(item), roomInLast = before % stack ? stack - before % stack : 0, can = Math.min(r.quantity, roomInLast + this.freeSlots(uid) * stack); if (can <= 0)
        return { ok: false, message: 'Túi Càn Khôn vẫn không còn chỗ trống.' }; database_1.default.transaction(() => { database_1.default.prepare(`INSERT INTO inventories(user_id,item_id,quantity) VALUES(?,?,?) ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+excluded.quantity`).run(uid, item, can); if (can === r.quantity)
        database_1.default.prepare('DELETE FROM temporary_storage WHERE user_id=? AND item_id=?').run(uid, item);
    else
        database_1.default.prepare('UPDATE temporary_storage SET quantity=quantity-? WHERE user_id=? AND item_id=?').run(can, uid, item); })(); return { ok: true, message: `Đã chuyển ${can} vật phẩm từ Tạm Nang vào Túi Càn Khôn.` }; }
    moveTemporaryToVault(uid, item) { this.sweepTemporary(uid); const r = database_1.default.prepare('SELECT quantity FROM temporary_storage WHERE user_id=? AND item_id=?').get(uid, item); if (!r)
        return { ok: false, message: 'Tạm Nang không có vật phẩm này.' }; database_1.default.transaction(() => { database_1.default.prepare(`INSERT INTO vault_inventory(user_id,item_id,quantity,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+excluded.quantity,updated_at=excluded.updated_at`).run(uid, item, r.quantity, now()); database_1.default.prepare('DELETE FROM temporary_storage WHERE user_id=? AND item_id=?').run(uid, item); })(); return { ok: true, message: 'Đã chuyển vật phẩm từ Tạm Nang về Tàng Khố Động Phủ.' }; }
    claimVault(uid, item) { const r = database_1.default.prepare('SELECT quantity FROM vault_inventory WHERE user_id=? AND item_id=?').get(uid, item); if (!r)
        return { ok: false, message: 'Tàng Khố không có vật phẩm này.' }; const before = this.quantity(uid, item), stack = this.maxStack(item), roomInLast = before % stack ? stack - before % stack : 0, can = Math.min(r.quantity, roomInLast + this.freeSlots(uid) * stack); if (can <= 0)
        return { ok: false, message: 'Túi Càn Khôn vẫn không còn chỗ trống.' }; database_1.default.transaction(() => { database_1.default.prepare(`INSERT INTO inventories(user_id,item_id,quantity) VALUES(?,?,?) ON CONFLICT(user_id,item_id) DO UPDATE SET quantity=quantity+excluded.quantity`).run(uid, item, can); if (can === r.quantity)
        database_1.default.prepare('DELETE FROM vault_inventory WHERE user_id=? AND item_id=?').run(uid, item);
    else
        database_1.default.prepare('UPDATE vault_inventory SET quantity=quantity-?,updated_at=? WHERE user_id=? AND item_id=?').run(can, now(), uid, item); })(); return { ok: true, message: `Đã lấy ${can} vật phẩm từ Tàng Khố.` }; }
    remove(uid, item, q = 1) { const n = this.quantity(uid, item); if (n < q || q <= 0)
        return false; if (n === q)
        database_1.default.prepare('DELETE FROM inventories WHERE user_id=? AND item_id=?').run(uid, item);
    else
        database_1.default.prepare('UPDATE inventories SET quantity=quantity-? WHERE user_id=? AND item_id=?').run(q, uid, item); return true; }
    quantity(uid, item) { return database_1.default.prepare('SELECT quantity FROM inventories WHERE user_id=? AND item_id=?').get(uid, item)?.quantity ?? 0; }
    equipped(uid, item) { return !!database_1.default.prepare('SELECT is_equipped FROM inventories WHERE user_id=? AND item_id=?').get(uid, item)?.is_equipped; }
    getUserInventory(uid) { this.ensureStorage(uid); return database_1.default.prepare('SELECT item_id,quantity,is_equipped FROM inventories WHERE user_id=? AND quantity>0 ORDER BY item_id').all(uid).map(x => ({ ...x, ...GameCatalog_1.ITEMS[x.item_id] })); }
}
exports.InventoryRepository = InventoryRepository;
exports.inventoryRepository = new InventoryRepository();
