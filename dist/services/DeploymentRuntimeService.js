"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploymentRuntime = void 0;
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const database_1 = __importDefault(require("../database/database"));
let phase = 'STARTING', server = null, snapshotRunning = false;
function vnDay(at) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(at)); }
function json(level, event, data = {}) { console.log(JSON.stringify({ ts: new Date().toISOString(), level, event, ...data })); }
exports.deploymentRuntime = {
    log: json,
    phase: () => phase,
    validateStorage() { const dir = path_1.default.dirname(config_1.config.dbPath); fs_1.default.mkdirSync(dir, { recursive: true }); fs_1.default.mkdirSync(config_1.config.snapshotDir, { recursive: true }); const probe = path_1.default.join(dir, `.write-probe-${process.pid}`); fs_1.default.writeFileSync(probe, 'ok', { flag: 'wx' }); fs_1.default.unlinkSync(probe); return { dbPath: path_1.default.resolve(config_1.config.dbPath), snapshotDir: path_1.default.resolve(config_1.config.snapshotDir) }; },
    startHealthServer(port = config_1.config.port) { if (server)
        return server; server = http_1.default.createServer((req, res) => { const known = req.url === '/healthz' || req.url === '/readyz'; res.setHeader('content-type', 'application/json; charset=utf-8'); if (!known) {
        res.statusCode = 404;
        res.end(JSON.stringify({ ok: false, error: 'NOT_FOUND' }));
        return;
    } const ready = phase === 'READY'; res.statusCode = ready ? 200 : 503; res.end(JSON.stringify({ ok: ready, phase, uptime_s: Math.floor(process.uptime()) })); }); server.listen(port, '0.0.0.0', () => json('info', 'health.listen', { port: server.address()?.port, phase })); return server; },
    markReady() { phase = 'READY'; json('info', 'runtime.ready'); },
    markStopping() { phase = 'STOPPING'; json('info', 'runtime.stopping'); },
    async stopHealthServer() { const s = server; server = null; if (!s)
        return; await new Promise(resolve => s.close(() => resolve())); },
    async snapshotIfDue(at = Date.now()) { if (snapshotRunning)
        return { created: false, reason: 'IN_PROGRESS' }; const day = vnDay(at), target = path_1.default.join(config_1.config.snapshotDir, `daily-${day}.sqlite`); if (fs_1.default.existsSync(target))
        return { created: false, reason: 'EXISTS', file: target }; snapshotRunning = true; try {
        fs_1.default.mkdirSync(config_1.config.snapshotDir, { recursive: true });
        const temp = `${target}.${process.pid}.tmp`;
        await database_1.default.backup(temp);
        if (!fs_1.default.statSync(temp).size)
            throw new Error('SNAPSHOT_EMPTY');
        fs_1.default.renameSync(temp, target);
        const files = fs_1.default.readdirSync(config_1.config.snapshotDir).filter(x => /^daily-\d{4}-\d{2}-\d{2}\.sqlite$/.test(x)).sort().reverse();
        for (const old of files.slice(config_1.config.snapshotRetention))
            fs_1.default.unlinkSync(path_1.default.join(config_1.config.snapshotDir, old));
        json('info', 'snapshot.created', { file: path_1.default.basename(target), retained: Math.min(files.length, config_1.config.snapshotRetention) });
        return { created: true, file: target };
    }
    finally {
        snapshotRunning = false;
    } },
    checkpoint() { try {
        database_1.default.pragma('wal_checkpoint(TRUNCATE)');
        return true;
    }
    catch {
        return false;
    } }
};
