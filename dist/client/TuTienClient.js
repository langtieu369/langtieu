"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuTienClient = void 0;
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class TuTienClient extends discord_js_1.Client {
    commands = new discord_js_1.Collection();
    constructor() { super({ intents: [discord_js_1.GatewayIntentBits.Guilds] }); }
    async start(token) { const dir = path_1.default.join(__dirname, '../commands/general'), retired = new Set(['admin.js', 'admin.ts', 'casino.js', 'casino.ts']); for (const f of fs_1.default.readdirSync(dir).filter(x => (x.endsWith('.js') || x.endsWith('.ts')) && !retired.has(x))) {
        const m = require(path_1.default.join(dir, f));
        const C = m.default;
        if (typeof C === 'function') {
            const c = new C();
            if (this.commands.has(c.data.name))
                throw new Error(`Trùng slash command: /${c.data.name}`);
            this.commands.set(c.data.name, c);
        }
    } await this.login(token); }
}
exports.TuTienClient = TuTienClient;
