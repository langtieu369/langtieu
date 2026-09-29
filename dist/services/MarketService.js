"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketService = void 0;
const database_1 = __importDefault(require("../database/database"));
const GameCatalog_1 = require("../config/GameCatalog");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const UserRepository_1 = require("../database/repositories/UserRepository");
const ItemInstanceService_1 = require("./ItemInstanceService");
const now = () => Date.now();
const tradeDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const overflowText = (r) => r.overflow ? ' Phần không đủ chỗ đã vào Tạm Nang.' : ' Vật phẩm đã vào Túi Càn Khôn.';
function remaining(uid) { const used = database_1.default.prepare('SELECT units_listed FROM trade_daily WHERE user_id=? AND day=?').get(uid, tradeDay())?.units_listed || 0; return Math.max(0, 5 - used); }
function countTrade(uid, q) { database_1.default.prepare(`INSERT INTO trade_daily(user_id,day,units_listed) VALUES(?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET units_listed=units_listed+excluded.units_listed`).run(uid, tradeDay(), q); }
exports.marketService = {
    sweepExpired() { const rows = database_1.default.prepare("SELECT * FROM market_listings WHERE status='active' AND expires_at<=?").all(now()); if (!rows.length)
        return; database_1.default.transaction(() => { for (const r of rows) {
        if (r.instance_id)
            ItemInstanceService_1.itemInstanceService.restoreEscrow(r.instance_id);
        else
            InventoryRepository_1.inventoryRepository.add(r.seller_id, r.item_id, r.quantity);
        database_1.default.prepare("UPDATE market_listings SET status='expired' WHERE id=?").run(r.id);
    } })(); },
    listings(limit = 8) { this.sweepExpired(); return database_1.default.prepare(`SELECT m.*,i.name,i.emoji,u.name seller_name FROM market_listings m JOIN items i ON i.id=m.item_id JOIN users u ON u.discord_id=m.seller_id WHERE m.status='active' ORDER BY m.created_at DESC LIMIT ?`).all(limit); },
    create(uid, itemInput, quantity, price) { this.sweepExpired(); if (price < 1)
        return { ok: false, message: 'Giá bán phải lớn hơn 0 Linh Thạch.' }; const instance = ItemInstanceService_1.itemInstanceService.get(itemInput); if (instance) {
        if (quantity !== 1)
            return { ok: false, message: 'Item instance chỉ có thể treo từng món.' };
        if (remaining(uid) < 1)
            return { ok: false, message: 'Hạn mức năm đơn vị hôm nay đã hết.' };
        const item = GameCatalog_1.ITEMS[instance.template_id];
        if (!item)
            return { ok: false, message: 'Template của item instance không tồn tại.' };
        const moved = ItemInstanceService_1.itemInstanceService.escrow(uid, itemInput);
        if (!moved.ok)
            return moved;
        database_1.default.transaction(() => { countTrade(uid, 1); database_1.default.prepare(`INSERT INTO market_listings(seller_id,item_id,instance_id,quantity,price,created_at,expires_at) VALUES(?,?,?,1,?,?,?)`).run(uid, instance.template_id, itemInput, price, now(), now() + 48 * 3600_000); })();
        return { ok: true, message: `🏮 Đã đưa item instance **${item.name}** lên Kim Vân Đài. Phí khi bán thành công: 5%.` };
    } const item = (0, GameCatalog_1.itemByNameOrId)(itemInput); if (!item)
        return { ok: false, message: 'Không tìm thấy vật phẩm hoặc item instance theo mã đã nhập.' }; if (!item.tradable)
        return { ok: false, message: 'Vật phẩm này đã bị khóa, không thể đưa lên Kim Vân Đài.' }; if (quantity < 1 || quantity > 5)
        return { ok: false, message: 'Mỗi lần chỉ có thể treo từ 1 đến 5 đơn vị.' }; if (InventoryRepository_1.inventoryRepository.quantity(uid, item.id) < quantity)
        return { ok: false, message: `Túi Càn Khôn không đủ **${item.name}**.` }; if (quantity > remaining(uid))
        return { ok: false, message: `Hạn mức hôm nay còn **${remaining(uid)}** đơn vị; từng vật phẩm trong stack đều được tính riêng.` }; database_1.default.transaction(() => { InventoryRepository_1.inventoryRepository.remove(uid, item.id, quantity); countTrade(uid, quantity); database_1.default.prepare(`INSERT INTO market_listings(seller_id,item_id,quantity,price,created_at,expires_at) VALUES(?,?,?,?,?,?)`).run(uid, item.id, quantity, price, now(), now() + 48 * 3600_000); })(); return { ok: true, message: `🏮 Đã đưa **${item.name} ×${quantity}** lên Kim Vân Đài với giá **${price} LT**. Khi bán thành công, hệ thống khấu trừ **5% phí giao dịch**.` }; },
    buy(uid, id) { this.sweepExpired(); const l = database_1.default.prepare("SELECT * FROM market_listings WHERE id=? AND status='active'").get(id); if (!l)
        return { ok: false, message: 'Giao dịch này không còn tồn tại.' }; if (l.seller_id === uid)
        return { ok: false, message: 'Không thể tự mua vật phẩm của chính mình.' }; const buyer = UserRepository_1.userRepository.get(uid); if (!buyer || buyer.coin_ha_pham < l.price)
        return { ok: false, message: 'Linh Thạch không đủ để hoàn thành giao dịch.' }; const tax = Math.max(1, Math.floor(l.price * .05)), sellerGain = l.price - tax; let note = ''; database_1.default.transaction(() => { database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham-? WHERE discord_id=?').run(l.price, uid); database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham+? WHERE discord_id=?').run(sellerGain, l.seller_id); if (l.instance_id) {
        const moved = ItemInstanceService_1.itemInstanceService.receiveFromEscrow(l.instance_id, uid);
        if (!moved.ok)
            throw new Error(moved.message);
        note = ' ' + moved.message;
    }
    else
        note = overflowText(InventoryRepository_1.inventoryRepository.add(uid, l.item_id, l.quantity)); database_1.default.prepare("UPDATE market_listings SET status='sold',buyer_id=? WHERE id=?").run(uid, id); })(); return { ok: true, message: `🤝 Giao dịch hoàn thành. Nhận **${(0, GameCatalog_1.itemName)(l.item_id)}${l.instance_id ? ' [instance]' : ` ×${l.quantity}`}** với giá **${l.price} LT**.${note}` }; },
    cancel(uid, id) { const l = database_1.default.prepare("SELECT * FROM market_listings WHERE id=? AND status='active'").get(id); if (!l || l.seller_id !== uid)
        return { ok: false, message: 'Không tìm thấy giao dịch đang bán của đạo hữu.' }; let note = ''; database_1.default.transaction(() => { if (l.instance_id)
        note = ' ' + ItemInstanceService_1.itemInstanceService.restoreEscrow(l.instance_id).message;
    else
        note = overflowText(InventoryRepository_1.inventoryRepository.add(uid, l.item_id, l.quantity)); database_1.default.prepare("UPDATE market_listings SET status='cancelled' WHERE id=?").run(id); })(); return { ok: true, message: `Đã thu hồi **${(0, GameCatalog_1.itemName)(l.item_id)}${l.instance_id ? ' [instance]' : ` ×${l.quantity}`}**.${note}` }; },
    buyNpc(uid, itemId) { const offer = GameCatalog_1.SHOP_OFFERS.find(x => x.item === itemId); if (!offer)
        return { ok: false, message: 'Nhất Phẩm Các hiện không bày bán vật phẩm này.' }; const u = UserRepository_1.userRepository.get(uid); if (u.coin_ha_pham < offer.price)
        return { ok: false, message: 'Linh Thạch không đủ.' }; let add; database_1.default.transaction(() => { database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham-? WHERE discord_id=?').run(offer.price, uid); add = InventoryRepository_1.inventoryRepository.add(uid, itemId, 1); })(); return { ok: true, message: `🏮 Đã mua **${GameCatalog_1.ITEMS[itemId].name}** với giá **${offer.price} LT**.${overflowText(add)}` }; },
    buyCplt(uid, itemId) { const offer = GameCatalog_1.CPLT_OFFERS.find(x => x.item === itemId); if (!offer)
        return { ok: false, message: 'Không có vật đổi này.' }; const u = UserRepository_1.userRepository.get(uid); if (u.knb < offer.price)
        return { ok: false, message: 'Cực Phẩm Linh Thạch không đủ.' }; let add; database_1.default.transaction(() => { database_1.default.prepare('UPDATE users SET knb=knb-? WHERE discord_id=?').run(offer.price, uid); add = InventoryRepository_1.inventoryRepository.add(uid, itemId, 1); })(); return { ok: true, message: `🔷 Đã đổi **${GameCatalog_1.ITEMS[itemId].name}** với **${offer.price} CPLT**.${overflowText(add)}` }; },
    exchangeToken(uid, token) { const reward = token === 'tranhai_lenh' ? 'pill_1' : 'beast_2'; if (InventoryRepository_1.inventoryRepository.quantity(uid, token) < 3)
        return { ok: false, message: `Cần **3 ${(0, GameCatalog_1.itemName)(token)}** để đổi vật.` }; let add; database_1.default.transaction(() => { InventoryRepository_1.inventoryRepository.remove(uid, token, 3); add = InventoryRepository_1.inventoryRepository.add(uid, reward, 1); })(); return { ok: true, message: `Đã dùng **3 ${(0, GameCatalog_1.itemName)(token)}** đổi lấy **${(0, GameCatalog_1.itemName)(reward)}**.${overflowText(add)}` }; }
};
