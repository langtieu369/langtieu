"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database/database");
const database_2 = __importDefault(require("./database/database"));
const RareFireCatalog_1 = require("./config/RareFireCatalog");
const GameCatalog_1 = require("./config/GameCatalog");
const RareFireResolver_1 = require("./services/RareFireResolver");
const RareFireService_1 = require("./services/RareFireService");
const UserRepository_1 = require("./database/repositories/UserRepository");
const InventoryRepository_1 = require("./database/repositories/InventoryRepository");
const CraftingService_1 = require("./services/CraftingService");
let passed = 0;
function ok(condition, message) { if (!condition)
    throw new Error(`FAIL: ${message}`); passed++; }
function close(actual, expected, tolerance, message) { ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected} ±${tolerance}`); }
function lcg(seed) { let s = seed >>> 0; return () => ((s = Math.imul(1664525, s) + 1013904223 >>> 0) / 4294967296); }
function gaussian(rand) { const u = Math.max(Number.EPSILON, rand()), v = Math.max(Number.EPSILON, rand()); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function simulation() {
    const rand = lcg(52047), n = 100000, profiles = [['novice', 58, 8], ['adept', 72, 7], ['expert', 84, 5]];
    const out = {};
    const order = ['fail', 'standard', 'fine', 'excellent', 'peak'];
    for (const [name, mean, sd] of profiles) {
        let basePeak = 0, matchedPeak = 0, doubleJump = 0;
        for (let i = 0; i < n; i++) {
            const base = Math.max(0, Math.min(100, mean + gaussian(rand) * sd));
            const before = (0, RareFireResolver_1.qualityBand)(base), after = (0, RareFireResolver_1.qualityBand)(Math.min(100, base + 4));
            basePeak += before === 'peak' ? 1 : 0;
            matchedPeak += after === 'peak' ? 1 : 0;
            doubleJump += order.indexOf(after) - order.indexOf(before) > 1 ? 1 : 0;
        }
        out[name] = { basePeak: basePeak / n, matchedPeak: matchedPeak / n, doubleJump };
    }
    close(out.expert.basePeak, .116, .012, 'Expert Phàm Hỏa Peak');
    close(out.expert.matchedPeak, .345, .018, 'Expert Đồng Tính Peak');
    ok(out.expert.matchedPeak < .40, 'Dị Hỏa không được bảo đảm Peak');
    ok(Object.values(out).every(x => x.doubleJump === 0), 'Không được nhảy quá một quality band');
    return out;
}
function run() {
    ok((0, RareFireCatalog_1.auditRareFireCatalog)().length === 0, 'Rare Fire catalog integrity');
    ok((0, GameCatalog_1.auditCatalog)().length === 0, 'Game catalog integrity sau khi tích hợp Dị Hỏa');
    ok(RareFireCatalog_1.RARE_FIRES.length === 6, 'Có đúng sáu Dị Hỏa canon');
    ok(GameCatalog_1.RECIPES.filter(r => r.kind === 'alchemy' || r.kind === 'forging').every(r => !!r.fire), 'Mọi recipe Đan/Khí seed có fire profile');
    ok(!!GameCatalog_1.ITEMS.hoa_tinh_tan_phien, 'Hỏa Tinh Tàn Phiến tồn tại');
    ok(!Object.keys(GameCatalog_1.ITEMS).some(x => x === 'material_rare_fire_shard'), 'Không giữ active ID Mảnh Dị Hỏa cũ');
    const gather = { domain: 'alchemy', preferred: ['tu', 'sinh'], allowed: ['binh'], opposed: ['phat'], qualityEligible: true };
    const matched = (0, RareFireResolver_1.resolveRareFire)('thanh_lien_tam_hoa', gather, 'hop_dung');
    ok(matched.compatibility === 'dong_tinh', 'Thanh Liên Đồng Tính với Tụ/Sinh');
    ok(matched.qualityModifier === 4, 'Quality sub-cap Đồng Tính là +4');
    ok(matched.specialtyBudget === 10, 'Hợp Dụng mở đủ specialty budget');
    const adverse = (0, RareFireResolver_1.resolveRareFire)('xich_duong_ly_hoa', gather, 'hop_dung');
    ok(adverse.compatibility === 'nghich_tinh', 'Xích Dương Nghịch Tính với quy trình Tụ/Sinh có Phát đối nghịch');
    ok(adverse.qualityModifier === -6, 'Nghịch Tính dùng sub-cap -6');
    ok(adverse.difficultyModifier > 0, 'Nghịch Tính phải tăng, không được làm giảm yêu cầu kiểm soát');
    ok(!(0, RareFireResolver_1.resolveRareFire)('khong_ton_tai', gather).allowed, 'Fire ID giả bị chặn');
    ok((0, RareFireResolver_1.applyFireQuality)(89, matched).band === 'peak', '89 + Đồng Tính có thể chạm Peak');
    ok((0, RareFireResolver_1.applyFireQuality)(50, matched).band === 'standard', 'Dị Hỏa không nâng người dùng yếu vượt nhiều band');
    const sim = simulation();
    (0, database_1.initDatabase)();
    const uid = '__rare_fire_runtime_test__';
    database_2.default.prepare('DELETE FROM users WHERE discord_id=?').run(uid);
    UserRepository_1.userRepository.create(uid, 'Rare Fire Test');
    UserRepository_1.userRepository.update(uid, { level: 550, coin_ha_pham: 999999 });
    const acquired = RareFireService_1.rareFireService.acquire(uid, 'thanh_lien_tam_hoa', 'runtime:test:van_lien_khai', 1700000000);
    ok(acquired.ok, 'Acquisition hợp lệ');
    ok(!RareFireService_1.rareFireService.acquire(uid, 'thanh_lien_tam_hoa', 'runtime:duplicate').ok, 'Duplicate acquisition bị chặn');
    ok(!RareFireService_1.rareFireService.acquire(uid, 'xich_duong_ly_hoa', ' ').ok, 'Provenance rỗng bị chặn');
    ok(!RareFireService_1.rareFireService.canUse(uid, 'thanh_lien_tam_hoa'), 'Chưa an trí thì không được dùng');
    ok(RareFireService_1.rareFireService.place(uid, 'thanh_lien_tam_hoa', 'test_fire_slot').ok, 'An trí Hỏa Vị thành công');
    ok(RareFireService_1.rareFireService.canUse(uid, 'thanh_lien_tam_hoa'), 'An trí xong được phép dùng');
    ok(RareFireService_1.rareFireService.setMastery(uid, 'thanh_lien_tam_hoa', 'hop_dung'), 'Cập nhật mastery hợp lệ');
    ok(!CraftingService_1.craftingService.craft(uid, 'cook_0', 'thanh_lien_tam_hoa').ok, 'Không thể lách Dị Hỏa vào recipe không hỗ trợ');
    const recipe = GameCatalog_1.RECIPES.find(r => r.id === 'alchemy_0');
    for (const [id, q] of recipe.ingredients)
        InventoryRepository_1.inventoryRepository.add(uid, id, q);
    const crafted = CraftingService_1.craftingService.craft(uid, recipe.id, 'thanh_lien_tam_hoa', 0);
    ok(crafted.ok, 'Crafting runtime với Dị Hỏa thành công');
    const log = database_2.default.prepare('SELECT * FROM rare_fire_process_log WHERE user_id=? ORDER BY id DESC LIMIT 1').get(uid);
    ok(log?.fire_id === 'thanh_lien_tam_hoa', 'Process log giữ provenance fire');
    ok(log?.final_score - log?.base_score <= 4, 'Runtime giữ Quality sub-cap');
    const output = database_2.default.prepare('SELECT * FROM crafted_outputs WHERE process_id=?').get(log.id);
    ok(output?.fire_id === 'thanh_lien_tam_hoa' && output?.quality_band === log.quality_band, 'Đầu ra lưu bền vững phẩm chất và provenance Dị Hỏa');
    RareFireService_1.rareFireService.unplace(uid, 'thanh_lien_tam_hoa');
    ok(!RareFireService_1.rareFireService.canUse(uid, 'thanh_lien_tam_hoa'), 'Tháo Hỏa Vị không mất ownership nhưng chặn sử dụng');
    ok(RareFireService_1.rareFireService.owns(uid, 'thanh_lien_tam_hoa'), 'Ownership còn sau unplace');
    database_2.default.prepare('DELETE FROM users WHERE discord_id=?').run(uid);
    console.log(`✅ Dị Hỏa runtime: ${passed} assertions PASS`);
    console.log(`✅ A43: Expert Peak ${Math.round(sim.expert.basePeak * 1000) / 10}% → ${Math.round(sim.expert.matchedPeak * 1000) / 10}%; double-band jump = 0`);
}
try {
    run();
}
catch (error) {
    console.error(error);
    process.exit(1);
}
