"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combatService = void 0;
const database_1 = __importDefault(require("../database/database"));
const GameCatalog_1 = require("../config/GameCatalog");
const UserRepository_1 = require("../database/repositories/UserRepository");
const InventoryRepository_1 = require("../database/repositories/InventoryRepository");
const DutyService_1 = require("./DutyService");
const CultivationService_1 = require("./CultivationService");
const crypto_1 = require("crypto");
const CombatEngineService_1 = require("./CombatEngineService");
const RankingSeasonService_1 = require("./RankingSeasonService");
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick(a) { let r = Math.random() * a.reduce((s, x) => s + x.weight, 0); for (const x of a) {
    r -= x.weight;
    if (r <= 0)
        return x;
} return a[0]; }
exports.combatService = {
    pvp(uid, targetId) { if (!(0, RankingSeasonService_1.pvpWindowOpen)())
        return { ok: false, message: 'Quần Hùng Tranh Phong mở mỗi ngày từ 16:00 đến 23:59 giờ Việt Nam.' }; if (uid === targetId)
        return { ok: false, message: 'Không thể tự luận võ với chính mình.' }; const a = UserRepository_1.userRepository.get(uid), b = UserRepository_1.userRepository.get(targetId); if (!a || !b)
        return { ok: false, message: 'Đối phương chưa có đạo hồ trong Thương Mang Thiên Hạ.' }; if (a.competitive_locked || b.competitive_locked)
        return { ok: false, message: 'Một trong hai đạo hữu đang bị khóa hoạt động cạnh tranh.' }; const z = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()), [x, y] = uid < targetId ? [uid, targetId] : [targetId, uid], pair = database_1.default.prepare('SELECT * FROM pvp_pair_daily WHERE day_key=? AND player_a=? AND player_b=?').get(z, x, y); if ((pair?.rewarded_matches || 0) + (pair?.review_matches || 0) >= 20)
        return { ok: false, message: 'Cặp đấu đã chạm trần 20 trận hôm nay.' }; const run = (0, crypto_1.randomUUID)(), fight = CombatEngineService_1.combatEngine.start({ mode: 'RANKED_PVP', sourceId: 'quan_hung', sourceRunId: run, players: [uid], opponents: [targetId], seed: `pvp:${z}:${x}:${y}:${(pair?.rewarded_matches || 0) + (pair?.review_matches || 0)}` }), result = CombatEngineService_1.combatEngine.replay(fight.encounterId).result, winner = (result.participants.find((p) => p.alive)?.id || uid), loser = winner === uid ? targetId : uid, rewarded = (pair?.rewarded_matches || 0) < 3; CombatEngineService_1.combatEngine.settle(fight.encounterId, `pvp:${run}`, () => { database_1.default.prepare('INSERT INTO pvp_pair_daily(day_key,player_a,player_b,rewarded_matches,review_matches) VALUES(?,?,?,?,?) ON CONFLICT(day_key,player_a,player_b) DO UPDATE SET rewarded_matches=rewarded_matches+excluded.rewarded_matches,review_matches=review_matches+excluded.review_matches').run(z, x, y, rewarded ? 1 : 0, rewarded ? 0 : 1); if (rewarded) {
        database_1.default.prepare('UPDATE users SET pvp_wins=pvp_wins+1,pvp_rating=pvp_rating+18,coin_ha_pham=coin_ha_pham+50 WHERE discord_id=?').run(winner);
        database_1.default.prepare('UPDATE users SET pvp_losses=pvp_losses+1,pvp_rating=MAX(0,pvp_rating-12) WHERE discord_id=?').run(loser);
        InventoryRepository_1.inventoryRepository.add(winner, 'xichduc_lenh', 1);
        RankingSeasonService_1.rankingSeasonService.recordPvp(winner, loser);
    } return { winner, loser, rewarded }; }); DutyService_1.dutyService.inc(uid, 'combat'); DutyService_1.dutyService.inc(targetId, 'combat'); return { ok: true, encounterId: fight.encounterId, message: `⚔️ **${winner === uid ? a.name : b.name}** thắng qua auto-resolve.${rewarded ? ' Người thắng nhận 50 LT + 1 Xích Dực Chiến Lệnh.' : ' Trận được lưu chiến báo nhưng không phát điểm/thưởng do lặp cặp.'}` }; },
    ensureBoss(bossId) { const b = GameCatalog_1.BOSSES.find(x => x.id === bossId); if (!b)
        return null; let s = database_1.default.prepare('SELECT * FROM boss_instances WHERE boss_id=?').get(bossId); const n = Date.now(); if (!s) {
        database_1.default.prepare('INSERT INTO boss_instances(boss_id,hp,max_hp,spawned_at,respawn_at) VALUES(?,?,?,?,0)').run(b.id, b.maxHp, b.maxHp, n);
        s = { boss_id: b.id, hp: b.maxHp, max_hp: b.maxHp, spawned_at: n, respawn_at: 0 };
    }
    else if (s.hp <= 0 && s.respawn_at <= n) {
        database_1.default.transaction(() => { database_1.default.prepare('UPDATE boss_instances SET hp=?,max_hp=?,spawned_at=?,respawn_at=0 WHERE boss_id=?').run(b.maxHp, b.maxHp, n, b.id); database_1.default.prepare('DELETE FROM boss_damage WHERE boss_id=?').run(b.id); })();
        s = { ...s, hp: b.maxHp, max_hp: b.maxHp, spawned_at: n, respawn_at: 0 };
    } return { boss: b, state: s }; },
    attackBoss(uid, bossId) { const pack = this.ensureBoss(bossId); if (!pack)
        return { ok: false, message: 'Không tìm thấy cường địch.' }; const { boss, state } = pack, u = UserRepository_1.userRepository.get(uid); if (!u)
        return { ok: false, message: 'Chưa có đạo hồ.' }; if ((0, GameCatalog_1.realmOf)(u.level).rank < boss.minRealm)
        return { ok: false, message: `Cường địch này yêu cầu **${GameCatalog_1.REALMS[boss.minRealm].name}** trở lên.` }; if (state.hp <= 0)
        return { ok: false, message: 'Cường địch đã bị hạ. Xích Dực Các đang chờ nó tái hiện.' }; if (u.stamina < boss.stamina)
        return { ok: false, message: `Cần **${boss.stamina} Khí Lực** để xuất chiến.` }; const run = (0, crypto_1.randomUUID)(), attemptHp = Math.min(state.hp, Math.max(500, Math.floor(boss.power * 3))), fight = CombatEngineService_1.combatEngine.start({ mode: 'BOSS', sourceId: `boss:${bossId}`, sourceRunId: run, players: [uid], enemies: [{ id: bossId, name: boss.name, hp: attemptHp, atk: Math.max(10, Math.floor(Math.sqrt(boss.power) * 2)), def: Math.max(5, Math.floor(Math.sqrt(boss.power))), speed: 95 }], seed: `boss:${bossId}:${uid}:${run}` }), detail = CombatEngineService_1.combatEngine.replay(fight.encounterId, 'DETAIL'), raw = (detail.events || []).filter((e) => e.actor_id === uid && e.target_id === bossId).reduce((n, e) => n + (JSON.parse(e.delta_json).damage || 0), 0); let effective = 0, remain = state.hp, killed = false; CombatEngineService_1.combatEngine.settle(fight.encounterId, `boss:${bossId}:attempt:${run}`, () => { const fresh = database_1.default.prepare('SELECT hp FROM boss_instances WHERE boss_id=?').get(bossId); effective = Math.min(fresh.hp, raw); remain = fresh.hp - effective; killed = remain <= 0; database_1.default.prepare('UPDATE users SET stamina=stamina-? WHERE discord_id=?').run(boss.stamina, uid); database_1.default.prepare('UPDATE boss_instances SET hp=?,respawn_at=? WHERE boss_id=?').run(remain, killed ? Date.now() + 12 * 3600_000 : 0, boss.id); database_1.default.prepare('INSERT INTO boss_damage(boss_id,user_id,damage) VALUES(?,?,?) ON CONFLICT(boss_id,user_id) DO UPDATE SET damage=damage+excluded.damage').run(boss.id, uid, effective); if (killed) {
        const parts = database_1.default.prepare('SELECT user_id FROM boss_damage WHERE boss_id=? AND damage>0').all(boss.id);
        for (const p of parts) {
            InventoryRepository_1.inventoryRepository.add(p.user_id, boss.drop, boss.dropQty[0]);
            database_1.default.prepare('UPDATE users SET coin_ha_pham=coin_ha_pham+? WHERE discord_id=?').run(boss.rewardLt, p.user_id);
        }
    } return { effective, remain, killed }; }); DutyService_1.dutyService.inc(uid, 'combat'); CultivationService_1.cultivationService.addTuVi(uid, 60 + boss.minRealm * 80); return { ok: true, encounterId: fight.encounterId, message: `⚔️ Auto-resolve gây **${effective.toLocaleString()}** sát thương hữu hiệu lên **${boss.name}**. Còn **${remain.toLocaleString()}/${boss.maxHp.toLocaleString()}**.${killed ? `\n🌠 Cường địch đã bị hạ; chiến lợi phẩm được quyết toán trực tiếp.` : ''}` }; },
    secretRealm(uid, realmId) { const sr = GameCatalog_1.SECRET_REALMS.find(x => x.id === realmId), u = UserRepository_1.userRepository.get(uid); if (!sr || !u)
        return { ok: false, message: 'Không tìm thấy bí cảnh.' }; if ((0, GameCatalog_1.realmOf)(u.level).rank < sr.minRealm)
        return { ok: false, message: `Bí cảnh yêu cầu **${GameCatalog_1.REALMS[sr.minRealm].name}** trở lên.` }; if (u.stamina < sr.stamina)
        return { ok: false, message: `Cần **${sr.stamina} Khí Lực** để nhập cảnh.` }; const hasMap = InventoryRepository_1.inventoryRepository.quantity(uid, 'co_do_tan_phien') > 0, run = (0, crypto_1.randomUUID)(), fight = CombatEngineService_1.combatEngine.start({ mode: 'DUNGEON', sourceId: `solo-realm:${realmId}`, sourceRunId: run, players: [uid], enemies: [{ id: `${realmId}:warden`, name: `Thủ Cảnh · ${sr.name}`, hp: Math.floor(sr.power * .9), atk: Math.max(10, Math.floor(Math.sqrt(sr.power) * 1.6)), def: Math.max(5, Math.floor(Math.sqrt(sr.power) * .8)), speed: 100 }], seed: `realm:${realmId}:${uid}:${run}` }), terminal = CombatEngineService_1.combatEngine.replay(fight.encounterId).result.terminal; let dropText = ''; CombatEngineService_1.combatEngine.settle(fight.encounterId, `realm:${realmId}:${run}`, () => { database_1.default.prepare('UPDATE users SET stamina=stamina-? WHERE discord_id=?').run(sr.stamina, uid); if (hasMap)
        InventoryRepository_1.inventoryRepository.remove(uid, 'co_do_tan_phien', 1); const success = terminal === 'VICTORY'; database_1.default.prepare('INSERT INTO secret_realm_log(user_id,realm_id,last_entered,clears) VALUES(?,?,?,?) ON CONFLICT(user_id,realm_id) DO UPDATE SET last_entered=excluded.last_entered,clears=clears+excluded.clears').run(uid, realmId, Date.now(), success ? 1 : 0); if (success) {
        const roll = parseInt((0, crypto_1.createHash)('sha256').update(run).digest('hex').slice(0, 8), 16) % sr.drops.reduce((n, x) => n + x.weight, 0);
        let n = roll, d = sr.drops[0];
        for (const x of sr.drops) {
            n -= x.weight;
            if (n < 0) {
                d = x;
                break;
            }
        }
        const q = d.min;
        InventoryRepository_1.inventoryRepository.add(uid, d.item, q);
        CultivationService_1.cultivationService.addTuVi(uid, sr.tuvi);
        dropText = ` Thu được ${(0, GameCatalog_1.itemEmoji)(d.item)} **${(0, GameCatalog_1.itemName)(d.item)} ×${q}** và **${sr.tuvi} Tu Vi**.`;
    } return { terminal }; }); DutyService_1.dutyService.inc(uid, 'combat'); return { ok: true, encounterId: fight.encounterId, message: terminal === 'VICTORY' ? `🏺 Phá cảnh thành công tại **${sr.name}**.${dropText}` : `🌫️ Bị trận thế ép lui tại **${sr.name}**; không có chiến lợi phẩm.` }; }
};
