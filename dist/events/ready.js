"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEventCycle = runEventCycle;
exports.stopEventScheduler = stopEventScheduler;
exports.onReady = onReady;
const discord_js_1 = require("discord.js");
const database_1 = __importStar(require("../database/database"));
const DialogueService_1 = require("../services/DialogueService");
const RuntimeSystemsService_1 = require("../services/RuntimeSystemsService");
const WorldEventGameplayService_1 = require("../services/WorldEventGameplayService");
const RankingSeasonService_1 = require("../services/RankingSeasonService");
const AuctionService_1 = require("../services/AuctionService");
const OwnerApprovalService_1 = require("../services/OwnerApprovalService");
const ActivityRuntimeService_1 = require("../services/ActivityRuntimeService");
const StartupAuditService_1 = require("../services/StartupAuditService");
const OperationalHardeningService_1 = require("../services/OperationalHardeningService");
const DeploymentRuntimeService_1 = require("../services/DeploymentRuntimeService");
let scheduler = null;
function runEventCycle(at = Date.now()) { if (!OperationalHardeningService_1.operationalHardeningService.acquireSchedulerCycle(at))
    return { ran: false, recovery: null }; const recovery = OperationalHardeningService_1.operationalHardeningService.recover(at), expired = database_1.default.prepare("SELECT id FROM world_event_runs WHERE status='ACTIVE' AND ends_at<=?").all(at); for (const run of expired)
    WorldEventGameplayService_1.worldEventGameplay.settle(run.id); RuntimeSystemsService_1.eventRuntime.tick(at); ActivityRuntimeService_1.anomalyRuntime.tick(at); AuctionService_1.auctionService.settle(at); OwnerApprovalService_1.ownerApprovalService.rejectExpired(); const current = RankingSeasonService_1.rankingSeasonService.keys(at), seasons = database_1.default.prepare('SELECT DISTINCT board,season_key FROM ranking_scores').all(); for (const s of seasons)
    if (s.season_key !== (s.board === 'QUAN_HUNG' ? current.week : current.month))
        RankingSeasonService_1.rankingSeasonService.settle(s.board, s.season_key); return { ran: true, recovery }; }
function stopEventScheduler() { if (scheduler) {
    clearInterval(scheduler);
    scheduler = null;
} }
async function onReady(client) { (0, database_1.initDatabase)(); const audit = (0, StartupAuditService_1.runStartupAudit)([...client.commands.keys()]); if (!audit.ok)
    throw new Error('Production startup audit failed:\n' + audit.errors.join('\n')); DialogueService_1.dialogueService.seedPresence(); runEventCycle(); void DeploymentRuntimeService_1.deploymentRuntime.snapshotIfDue().catch(error => DeploymentRuntimeService_1.deploymentRuntime.log('error', 'snapshot.failed', { error: String(error) })); scheduler = setInterval(() => { runEventCycle(); void DeploymentRuntimeService_1.deploymentRuntime.snapshotIfDue().catch(error => DeploymentRuntimeService_1.deploymentRuntime.log('error', 'snapshot.failed', { error: String(error) })); }, 60_000); scheduler.unref(); const rest = new discord_js_1.REST({ version: '10' }).setToken(client.token); await rest.put(discord_js_1.Routes.applicationCommands(client.user.id), { body: client.commands.map(c => c.data.toJSON()) }); console.log(`✅ ${client.user?.tag} online · ${client.commands.size} slash commands · ${audit.checks} startup checks · scheduler Asia/Ho_Chi_Minh active`); }
