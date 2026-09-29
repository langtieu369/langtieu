"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.effectService = void 0;
const database_1 = __importDefault(require("../database/database"));
exports.effectService = { apply(uid, item, effect, minutes) { database_1.default.prepare('DELETE FROM active_effects WHERE user_id=?').run(uid); database_1.default.prepare('INSERT INTO active_effects(user_id,source_item,effect_json,expires_at) VALUES(?,?,?,?)').run(uid, item, JSON.stringify(effect), Date.now() + minutes * 60000); }, get(uid) { database_1.default.prepare('DELETE FROM active_effects WHERE expires_at<=?').run(Date.now()); return database_1.default.prepare('SELECT * FROM active_effects WHERE user_id=?').all(uid); }, aggregate(uid) { const out = {}; for (const r of this.get(uid)) {
        for (const [k, v] of Object.entries(JSON.parse(r.effect_json)))
            out[k] = (out[k] || 0) + v;
    } return out; } };
