"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auctionService = void 0;
const database_1 = __importDefault(require("../database/database"));
const ItemInstanceService_1 = require("./ItemInstanceService");
const UserRepository_1 = require("../database/repositories/UserRepository");
exports.auctionService = {
    create(uid, instanceId, startPrice, hours = 6) { if (startPrice < 100 || hours < 1 || hours > 24)
        return { ok: false, message: 'Giá khởi điểm tối thiểu 100 LT; thời hạn 1–24 giờ.' }; const moved = ItemInstanceService_1.itemInstanceService.escrow(uid, instanceId); if (!moved.ok)
        return moved; try {
        const r = database_1.default.prepare("INSERT INTO auction_listings(seller_id,instance_id,start_price,ends_at,status,created_at) VALUES(?,?,?,?, 'ACTIVE',?)").run(uid, instanceId, Math.floor(startPrice), Date.now() + hours * 3600_000, Date.now());
        return { ok: true, id: Number(r.lastInsertRowid), message: 'Đã mở phiên đấu giá; vật mang nằm trong escrow riêng.' };
    }
    catch {
        ItemInstanceService_1.itemInstanceService.restoreEscrow(instanceId);
        return { ok: false, message: 'Không thể mở phiên đấu giá.' };
    } },
    bid(uid, id, amount) { this.settle(); const a = database_1.default.prepare("SELECT * FROM auction_listings WHERE id=? AND status='ACTIVE'").get(id), u = UserRepository_1.userRepository.get(uid); if (!a || !u || a.seller_id === uid)
        return { ok: false, message: 'Phiên đấu giá không hợp lệ.' }; const min = Math.max(a.start_price, a.current_bid ? Math.ceil(a.current_bid * 1.05) : 0); if (amount < min || u.coin_ha_pham < amount)
        return { ok: false, message: `Cần đặt ít nhất ${min} LT và có đủ số dư.` }; database_1.default.transaction(() => { database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham-? WHERE discord_id=?').run(amount, uid); if (a.bidder_id)
        database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham+? WHERE discord_id=?').run(a.current_bid, a.bidder_id); database_1.default.prepare('UPDATE auction_listings SET current_bid=?,bidder_id=? WHERE id=?').run(amount, uid, id); })(); return { ok: true, message: `Đã giữ ${amount} LT trong escrow đấu giá.` }; },
    settle(at = Date.now()) { const a = database_1.default.prepare("SELECT * FROM auction_listings WHERE status='ACTIVE' AND ends_at<=?").all(at); for (const x of a)
        database_1.default.transaction(() => { if (!x.bidder_id) {
            ItemInstanceService_1.itemInstanceService.restoreEscrow(x.instance_id);
            database_1.default.prepare("UPDATE auction_listings SET status='EXPIRED' WHERE id=?").run(x.id);
            return;
        } const fee = Math.ceil(x.current_bid * .05); database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham+? WHERE discord_id=?').run(x.current_bid - fee, x.seller_id); const r = ItemInstanceService_1.itemInstanceService.receiveFromEscrow(x.instance_id, x.bidder_id); if (!r.ok)
            throw new Error(r.message); database_1.default.prepare("UPDATE auction_listings SET status='SOLD' WHERE id=?").run(x.id); })(); return a.length; },
    active() { this.settle(); return database_1.default.prepare("SELECT a.*,u.name seller_name FROM auction_listings a JOIN users u ON u.discord_id=a.seller_id WHERE a.status='ACTIVE' ORDER BY a.ends_at").all(); }
};
