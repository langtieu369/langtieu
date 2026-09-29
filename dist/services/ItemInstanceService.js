"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemInstanceService = void 0;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../database/database"));
const GameCatalog_1 = require("../config/GameCatalog");
const creationLore_1 = require("../data/creationLore");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const now = () => Date.now();
const qualityMultiplier = { pham: 1, linh: 1.08, huyen: 1.18, dia: 1.32, thien: 1.5, tien: 1.75 };
function record(instanceId, uid, event, payload = {}) { database_1.default.prepare('INSERT INTO item_instance_history(instance_id,owner_id,event,payload_json,created_at) VALUES(?,?,?,?,?)').run(instanceId, uid, event, JSON.stringify(payload), now()); }
exports.itemInstanceService = {
    create(uid, templateId, kind, provenance, options = {}) { const id = (0, crypto_1.randomUUID)(), item = GameCatalog_1.ITEMS[templateId], max = options.maxDurability ?? (kind === 'weapon' || kind === 'armor' || kind === 'tool' ? 100 : null), location = options.location || (InventoryRepository_1.inventoryRepository.freeSlots(uid) > 0 ? 'INVENTORY' : 'TEMPORARY'), expiry = location === 'TEMPORARY' ? now() + 86_400_000 : null, t = now(); database_1.default.prepare(`INSERT INTO item_instances(instance_id,template_id,owner_id,kind,quality,durability,max_durability,binding,state,location,equipped_slot,provenance_json,meta_json,temporary_expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, templateId, uid, kind, options.quality || item?.rarity || 'pham', max, max, options.binding || 'UNBOUND', options.state || 'ACTIVE', location, options.equippedSlot || null, JSON.stringify(provenance), JSON.stringify(options.meta || {}), expiry, t, t); record(id, uid, 'CREATED', { provenance, location }); return this.get(id); },
    createHeirloom(uid, h) { const effect = h.id === 'co_kiem_tan_van' ? { atkPct: .01 } : h.id === 'ngoc_tam_vo_danh' ? { tuViPct: .01 } : h.id === 'long_vu_phuong_hoang' ? { speedPct: .01 } : { defPct: .01 }; return this.create(uid, `heirloom:${h.id}`, 'heirloom', { source: 'CHARACTER_CREATION', heirloomId: h.id }, { quality: 'huyen', binding: 'SOULBOUND', location: 'HEIRLOOM_LEDGER', equippedSlot: 'heirloom', state: 'DORMANT', meta: { name: h.name, icon: h.icon, description: h.description, effect } }); },
    grantCreation(uid, backgroundId, heirloom) { const h = this.createHeirloom(uid, heirloom); let gift = null; if (backgroundId === 'tu_chien_gia_toc')
        gift = this.create(uid, 'gia_truyen_kiem', 'weapon', { source: 'CHARACTER_CREATION', backgroundId }, { binding: 'SOULBOUND', meta: { lineage: true } });
    else if (backgroundId === 'ky_ngo_sinh_tu')
        gift = this.create(uid, 'manh_ngoc_ho_menh', 'keepsake', { source: 'CHARACTER_CREATION', backgroundId }, { binding: 'SOULBOUND', state: 'INTACT', maxDurability: null, equippedSlot: 'keepsake', meta: { wardCharges: 1, effect: { defPct: .02 } } });
    else if (backgroundId === 'de_tu_tan_tu')
        database_1.default.prepare(`INSERT INTO knowledge_provenance(user_id,fact_key,source_kind,source_ref,confidence,learned_at) VALUES(?,?,?,?,?,?) ON CONFLICT DO NOTHING`).run(uid, 'manual:sach_khai_kinh', 'CONFIRMED', 'creation:de_tu_tan_tu', 'confirmed', now()); return { heirloom: h, gift }; },
    get(id) { return database_1.default.prepare('SELECT * FROM item_instances WHERE instance_id=?').get(id); },
    list(uid, location = 'INVENTORY') { this.sweepTemporary(uid); return database_1.default.prepare('SELECT * FROM item_instances WHERE owner_id=? AND location=? AND state!=? ORDER BY created_at').all(uid, location, 'DESTROYED'); },
    display(x) { const item = GameCatalog_1.ITEMS[x.template_id], meta = JSON.parse(x.meta_json || '{}'); return { name: item?.name || meta.name || x.template_id, emoji: item?.emoji || meta.icon || '🏺', ...x, meta }; },
    equip(uid, id) { const x = this.get(id); if (!x || x.owner_id !== uid || x.location !== 'INVENTORY' || x.state === 'DESTROYED')
        return { ok: false, message: 'Không tìm thấy vật mang có thể trang bị.' }; if (!['weapon', 'armor'].includes(x.kind))
        return { ok: false, message: 'Vật này không thuộc ô trang bị.' }; if ((x.durability ?? 1) <= 0)
        return { ok: false, message: 'Vật mang đã tổn hại, cần tu bổ trước.' }; database_1.default.transaction(() => { database_1.default.prepare('UPDATE item_instances SET equipped_slot=NULL,updated_at=? WHERE owner_id=? AND equipped_slot=?').run(now(), uid, x.kind); database_1.default.prepare('UPDATE item_instances SET equipped_slot=?,updated_at=? WHERE instance_id=?').run(x.kind, now(), id); record(id, uid, 'EQUIPPED', { slot: x.kind }); })(); return { ok: true, message: `Đã trang bị **${this.display(x).name}**.` }; },
    stats(uid) { const rows = database_1.default.prepare("SELECT * FROM item_instances WHERE owner_id=? AND equipped_slot IS NOT NULL AND state!='DESTROYED'").all(uid), out = { atk: 0, def: 0, hp: 0, crit: 0, atkPct: 0, defPct: 0, speedPct: 0, tuViPct: 0 }; for (const x of rows) {
        if (x.kind === 'heirloom' && x.state === 'DORMANT' || x.kind === 'keepsake' && x.state === 'CRACKED')
            continue;
        const item = GameCatalog_1.ITEMS[x.template_id], meta = JSON.parse(x.meta_json || '{}'), mult = qualityMultiplier[x.quality] || 1;
        for (const [k, v] of Object.entries(item?.stats || {}))
            out[k] = (out[k] || 0) + v * mult;
        for (const [k, v] of Object.entries(meta.effect || {}))
            out[k] = (out[k] || 0) + v;
    } return out; },
    damage(uid, id, amount = 1) { const x = this.get(id); if (!x || x.owner_id !== uid || x.durability === null)
        return { ok: false, message: 'Vật mang không có độ bền.' }; const d = Math.max(0, x.durability - Math.max(1, amount)); database_1.default.prepare('UPDATE item_instances SET durability=?,updated_at=? WHERE instance_id=?').run(d, now(), id); record(id, uid, 'DURABILITY_LOSS', { amount, before: x.durability, after: d }); return { ok: true, message: d ? `Độ bền còn ${d}/${x.max_durability}.` : 'Vật mang đã tổn hại và ngừng phát huy hiệu lực.' }; },
    repair(uid, id) { const x = this.get(id); if (!x || x.owner_id !== uid || x.durability === null || x.max_durability === null)
        return { ok: false, message: 'Vật này không cần tu bổ.' }; const missing = x.max_durability - x.durability; if (missing <= 0)
        return { ok: true, message: 'Vật mang đang nguyên vẹn.' }; const cost = missing * 5, u = database_1.default.prepare('SELECT coin_ha_pham FROM users WHERE discord_id=?').get(uid); if (!u || u.coin_ha_pham < cost)
        return { ok: false, message: `Cần ${cost} LT để tu bổ.` }; database_1.default.transaction(() => { database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham-? WHERE discord_id=?').run(cost, uid); database_1.default.prepare('UPDATE item_instances SET durability=max_durability,updated_at=? WHERE instance_id=?').run(now(), id); record(id, uid, 'REPAIRED', { cost }); })(); return { ok: true, message: `Đã tu bổ hoàn chỉnh với ${cost} LT.` }; },
    triggerWard(uid) { const x = database_1.default.prepare("SELECT * FROM item_instances WHERE owner_id=? AND template_id='manh_ngoc_ho_menh' AND state='INTACT'").get(uid); if (!x)
        return false; database_1.default.prepare("UPDATE item_instances SET state='CRACKED',meta_json=?,updated_at=? WHERE instance_id=?").run(JSON.stringify({ wardCharges: 0 }), now(), x.instance_id); record(x.instance_id, uid, 'WARD_TRIGGERED'); return true; },
    restoreWard(uid, id) { const x = this.get(id); if (!x || x.owner_id !== uid || x.template_id !== 'manh_ngoc_ho_menh' || x.state !== 'CRACKED')
        return { ok: false, message: 'Mảnh ngọc không ở trạng thái cần tĩnh dưỡng.' }; const u = database_1.default.prepare('SELECT coin_ha_pham FROM users WHERE discord_id=?').get(uid); if (u.coin_ha_pham < 500)
        return { ok: false, message: 'Cần 500 LT để dựng trận tĩnh dưỡng.' }; database_1.default.transaction(() => { database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham-500 WHERE discord_id=?').run(uid); database_1.default.prepare("UPDATE item_instances SET state='INTACT',meta_json=?,updated_at=? WHERE instance_id=?").run(JSON.stringify({ wardCharges: 1 }), now(), id); record(id, uid, 'WARD_RESTORED', { cost: 500 }); })(); return { ok: true, message: 'Mảnh ngọc đã trở lại trạng thái Nguyên Vẹn.' }; },
    identifyHeirloom(uid, id) { const x = this.get(id); if (!x || x.owner_id !== uid || x.kind !== 'heirloom')
        return { ok: false, message: 'Không tìm thấy Cổ vật.' }; if (x.state !== 'DORMANT')
        return { ok: true, message: 'Cổ vật đã được giám định.' }; database_1.default.prepare("UPDATE item_instances SET state='IDENTIFIED',updated_at=? WHERE instance_id=?").run(now(), id); record(id, uid, 'HEIRLOOM_IDENTIFIED', { source: 'Tử Hà Các' }); return { ok: true, message: 'Tử Hà Các đã hoàn tất giám định; hiệu ứng Cổ vật bắt đầu cộng hưởng.' }; },
    history(uid, id) { const x = this.get(id); if (!x || x.owner_id !== uid)
        return []; return database_1.default.prepare('SELECT * FROM item_instance_history WHERE instance_id=? ORDER BY created_at').all(id); },
    moveToVault(uid, id) { const x = this.get(id); if (!x || x.owner_id !== uid || x.equipped_slot)
        return { ok: false, message: 'Không thể chuyển vật này vào Tàng Khố.' }; database_1.default.prepare("UPDATE item_instances SET location='VAULT',temporary_expires_at=NULL,updated_at=? WHERE instance_id=?").run(now(), id); record(id, uid, 'MOVED_TO_VAULT'); return { ok: true, message: 'Đã đưa vật mang vào Tàng Khố.' }; },
    claim(uid, id) { const x = this.get(id); if (!x || x.owner_id !== uid || !['VAULT', 'TEMPORARY'].includes(x.location))
        return { ok: false, message: 'Không tìm thấy vật mang cần nhận.' }; if (InventoryRepository_1.inventoryRepository.freeSlots(uid) < 1)
        return { ok: false, message: 'Túi Càn Khôn không còn ô trống.' }; database_1.default.prepare("UPDATE item_instances SET location='INVENTORY',temporary_expires_at=NULL,updated_at=? WHERE instance_id=?").run(now(), id); record(id, uid, 'CLAIMED_TO_INVENTORY'); return { ok: true, message: 'Đã chuyển vật mang vào Túi Càn Khôn.' }; },
    escrow(uid, id) { const x = this.get(id); if (!x || x.owner_id !== uid || x.location !== 'INVENTORY')
        return { ok: false, message: 'Không tìm thấy vật mang trong Túi Càn Khôn.' }; if (x.binding !== 'UNBOUND')
        return { ok: false, message: 'Vật mang đã khóa chủ, không thể giao dịch.' }; const spirit = database_1.default.prepare('SELECT stage FROM spirit_cores WHERE instance_id=?').get(id); if (spirit && !['TRAM_TICH', 'TIEM_TANG'].includes(spirit.stage))
        return { ok: false, message: 'Vật Mang có Khí Linh chỉ giao dịch được ở Trầm Tịch hoặc Tiềm Tàng.' }; if (x.equipped_slot)
        return { ok: false, message: 'Hãy tháo vật mang trước khi giao dịch.' }; database_1.default.prepare("UPDATE item_instances SET location='ESCROW',updated_at=? WHERE instance_id=?").run(now(), id); record(id, uid, 'MARKET_ESCROW'); return { ok: true, message: 'Đã đưa vật mang vào escrow.' }; },
    receiveFromEscrow(id, buyer) { const x = this.get(id); if (!x || x.location !== 'ESCROW' || x.binding !== 'UNBOUND')
        return { ok: false, message: 'Item instance không còn ở trạng thái giao dịch.' }; const location = InventoryRepository_1.inventoryRepository.freeSlots(buyer) > 0 ? 'INVENTORY' : 'TEMPORARY', expiry = location === 'TEMPORARY' ? now() + 86_400_000 : null; database_1.default.prepare('UPDATE item_instances SET owner_id=?,location=?,temporary_expires_at=?,updated_at=? WHERE instance_id=?').run(buyer, location, expiry, now(), id); record(id, buyer, 'OWNERSHIP_TRANSFERRED', { from: x.owner_id, to: buyer, via: 'KIM_VAN_DAI' }); return { ok: true, message: location === 'TEMPORARY' ? 'Vật mang đã vào Tạm Nang.' : 'Vật mang đã vào Túi Càn Khôn.' }; },
    restoreEscrow(id) { const x = this.get(id); if (!x || x.location !== 'ESCROW')
        return { ok: false, message: 'Vật mang không ở escrow.' }; const location = InventoryRepository_1.inventoryRepository.freeSlots(x.owner_id) > 0 ? 'INVENTORY' : 'TEMPORARY', expiry = location === 'TEMPORARY' ? now() + 86_400_000 : null; database_1.default.prepare('UPDATE item_instances SET location=?,temporary_expires_at=?,updated_at=? WHERE instance_id=?').run(location, expiry, now(), id); record(id, x.owner_id, 'ESCROW_RETURNED', { location }); return { ok: true, message: 'Đã hoàn trả vật mang.' }; },
    sweepTemporary(uid) { const rows = (uid ? database_1.default.prepare("SELECT * FROM item_instances WHERE owner_id=? AND location='TEMPORARY' AND temporary_expires_at<=?").all(uid, now()) : database_1.default.prepare("SELECT * FROM item_instances WHERE location='TEMPORARY' AND temporary_expires_at<=?").all(now())); for (const x of rows) {
        database_1.default.prepare("UPDATE item_instances SET location='VAULT',temporary_expires_at=NULL,updated_at=? WHERE instance_id=?").run(now(), x.instance_id);
        record(x.instance_id, x.owner_id, 'PROTECTED_EXPIRY_TO_VAULT');
    } return rows.length; },
    audit() { const errors = []; for (const h of creationLore_1.HEIRLOOMS)
        if (!h.effect)
            errors.push(`${h.id}: Cổ vật thiếu effect`); return errors; }
};
