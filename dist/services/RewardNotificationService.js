"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardNotificationService = void 0;
const database_1 = __importDefault(require("../database/database"));
exports.rewardNotificationService = {
    push(uid, source, message, overflow = false) { database_1.default.prepare('INSERT INTO reward_notifications(user_id,source,message,overflow,created_at) VALUES(?,?,?,?,?)').run(uid, source, message, overflow ? 1 : 0, Date.now()); },
    unread(uid) { return database_1.default.prepare('SELECT * FROM reward_notifications WHERE user_id=? AND read_at IS NULL ORDER BY created_at DESC').all(uid); },
    read(uid, id) { return database_1.default.prepare('UPDATE reward_notifications SET read_at=? WHERE id=? AND user_id=? AND read_at IS NULL').run(Date.now(), id, uid).changes === 1; }
};
