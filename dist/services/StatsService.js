"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsService = void 0;
const UserRepository_1 = require("../database/repositories/UserRepository");
const EquipmentService_1 = require("./EquipmentService");
const EffectService_1 = require("./EffectService");
const GameCatalog_1 = require("../config/GameCatalog");
exports.statsService = { get(uid) { const u = UserRepository_1.userRepository.get(uid); if (!u)
        return null; const eq = EquipmentService_1.equipmentService.stats(uid), e = EffectService_1.effectService.aggregate(uid), r = (0, GameCatalog_1.realmOf)(u.level); const baseHp = u.max_hp + u.level * 9 + r.rank * 120, baseAtk = u.atk + u.level * 2 + r.rank * 18, baseDef = u.def + Math.floor(u.level * 1.4) + r.rank * 15; const hp = Math.round((baseHp + (eq.hp || 0)) * (1 + (e.hpPct || 0))), atk = Math.round((baseAtk + (eq.atk || 0)) * (1 + (e.atkPct || 0) + (eq.atkPct || 0))), def = Math.round((baseDef + (eq.def || 0)) * (1 + (e.defPct || 0) + (eq.defPct || 0))), speed = Math.round((u.speed + r.rank * 3) * (1 + (e.speedPct || 0) + (eq.speedPct || 0))), crit = Math.max(0, (eq.crit || 0) + (e.critFlat || 0)); const power = Math.max(1, Math.round(atk * 3 + def * 2 + hp * .35 + speed + crit * 1000)); return { hp, atk, def, speed, crit, power }; } };
