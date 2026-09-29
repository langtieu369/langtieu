"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worldService = void 0;
const GameCatalog_1 = require("../config/GameCatalog");
const UserRepository_1 = require("../database/repositories/UserRepository");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const database_1 = __importDefault(require("../database/database"));
const DutyService_1 = require("./DutyService");
const CultivationService_1 = require("./CultivationService");
const RuntimeSystemsService_1 = require("./RuntimeSystemsService");
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick(a) { let r = Math.random() * a.reduce((s, x) => s + x.weight, 0); for (const x of a) {
    r -= x.weight;
    if (r <= 0)
        return x;
} return a[0]; }
exports.worldService = { locations(branch) { return GameCatalog_1.LOCATIONS.filter(x => x.branch === branch); }, act(uid, locId) { const u = UserRepository_1.userRepository.get(uid); if (!u)
        return { ok: false, message: 'Đạo hữu chưa lập đạo hồ.' }; const l = GameCatalog_1.LOCATIONS.find(x => x.id === locId); if (!l)
        return { ok: false, message: 'Không tìm thấy địa vực.' }; const realm = (0, GameCatalog_1.realmOf)(u.level); if (realm.rank < l.minRealm)
        return { ok: false, message: `🔒 **${l.name}** yêu cầu **${GameCatalog_1.REALMS[l.minRealm].name}** trở lên.` }; if (u.stamina < l.stamina)
        return { ok: false, message: `Khí lực đã suy, cần ít nhất **${l.stamina}** để tiếp tục.` }; const d = pick(l.drops), qty = rand(d.min, d.max), lt = rand(l.lt[0], l.lt[1]), tuvi = rand(l.tuvi[0], l.tuvi[1]); let overflow = 0; database_1.default.transaction(() => { database_1.default.prepare('UPDATE users SET stamina=stamina-?,coin_ha_pham=coin_ha_pham+?,current_location=?,updated_at=? WHERE discord_id=?').run(l.stamina, lt, locId, Date.now(), uid); overflow = InventoryRepository_1.inventoryRepository.add(uid, d.item, qty).overflow; database_1.default.prepare('INSERT OR IGNORE INTO discoveries(user_id,item_id,discovered_at) VALUES(?,?,?)').run(uid, d.item, Date.now()); })(); const grow = CultivationService_1.cultivationService.addTuVi(uid, tuvi), map = { patrolling: 'tuan_tra', escort: 'ho_tong', gathering: 'ho_sinh', adventure: 'dieu_tra', archaeology: 'dieu_tra', fishing: 'tam_nhan', mining: 'tran_nhieu', jade: 'tran_nhieu' }; DutyService_1.dutyService.inc(uid, l.branch === 'fishing' ? 'fish' : 'work'); RuntimeSystemsService_1.dutyRuntime.progress(uid, map[l.branch]); return { ok: true, message: `${(0, GameCatalog_1.itemEmoji)(d.item)} Tại **${l.parent} · ${l.name}**, đạo hữu thu được **${(0, GameCatalog_1.itemName)(d.item)} ×${qty}**, 💠 **${lt} LT** và **${tuvi} Tu Vi**.${overflow ? ' Vật phẩm tràn đã vào Tạm Nang.' : ''}${grow.message ? `\n${grow.message}` : ''}` }; } };
