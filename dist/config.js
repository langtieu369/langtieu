"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
const path_1 = __importDefault(require("path"));
exports.config = {
    token: process.env.DISCORD_TOKEN || '',
    dbPath: process.env.DB_PATH || './data/tutien.db',
    port: Number(process.env.PORT || 3000),
    snapshotDir: process.env.SNAPSHOT_DIR || path_1.default.join(path_1.default.dirname(process.env.DB_PATH || './data/tutien.db'), 'snapshots'),
    snapshotRetention: Math.max(1, Number(process.env.SNAPSHOT_RETENTION || 7))
};
