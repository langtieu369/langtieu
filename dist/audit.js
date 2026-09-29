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
const GameCatalog_1 = require("./config/GameCatalog");
const SystemRegistry_1 = require("./config/SystemRegistry");
const RareFireCatalog_1 = require("./config/RareFireCatalog");
const JourneyCatalog_1 = require("./config/JourneyCatalog");
const JourneyProductionCatalog_1 = require("./config/JourneyProductionCatalog");
const JourneyRegistry_1 = require("./config/JourneyRegistry");
const StorageService_1 = require("./services/StorageService");
const ItemInstanceService_1 = require("./services/ItemInstanceService");
const database_1 = __importStar(require("./database/database"));
const RuntimeCatalog_1 = require("./config/RuntimeCatalog");
const RuntimeSystemsService_1 = require("./services/RuntimeSystemsService");
const CombatCatalog_1 = require("./config/CombatCatalog");
const ActivityCatalog_1 = require("./config/ActivityCatalog");
const RuntimeKernelService_1 = require("./services/RuntimeKernelService");
const TowerService_1 = require("./services/TowerService");
const emojis_1 = require("./config/emojis");
const ItemNames_1 = require("./config/ItemNames");
const StartupAuditService_1 = require("./services/StartupAuditService");
const RealmNpcVisitService_1 = require("./services/RealmNpcVisitService");
(0, database_1.initDatabase)();
const materializedTables = ['operation_receipts', 'runtime_leases', 'outbox_events', 'content_pins', 'combat_encounters', 'combat_events', 'combat_settlements', 'dungeon_runs', 'dungeon_room_receipts', 'player_sects', 'player_sect_buildings', 'player_sect_warehouse', 'partner_bonds', 'dual_cultivation_sessions', 'mentorship_bonds', 'guidance_receipts', 'npc_companion_states', 'rare_duty_states', 'rare_duty_evidence', 'anomaly_runs', 'world_merit_ledger', 'tower_runs', 'tower_floor_receipts', 'realm_npc_visits', 'onboarding_milestones', 'player_credentials', 'interaction_receipts', 'interaction_rate_limits'];
const materialized = materializedTables.filter(t => !database_1.default.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t)).map(t => `${t}: missing materialized table`);
const catalog = (0, GameCatalog_1.auditCatalog)(), access = (0, SystemRegistry_1.auditSystemAccess)(), fires = (0, RareFireCatalog_1.auditRareFireCatalog)(), journeys = [...(0, JourneyCatalog_1.auditJourneyCatalog)(), ...(0, JourneyRegistry_1.auditJourneyRegistry)(), ...(0, JourneyProductionCatalog_1.auditProductionJourneys)()], storage = StorageService_1.storageService.audit(), instances = ItemInstanceService_1.itemInstanceService.audit(), runtime = [...(0, RuntimeCatalog_1.auditRuntimeCatalog)(), ...(0, RuntimeSystemsService_1.auditRuntimeTables)(), ...(0, CombatCatalog_1.auditCombatCatalog)(), ...(0, ActivityCatalog_1.auditActivityCatalog)(), ...RuntimeKernelService_1.contentResolver.audit(), ...TowerService_1.towerService.audit(), ...RealmNpcVisitService_1.realmNpcVisitService.audit(), ...materialized];
const startup = (0, StartupAuditService_1.runStartupAudit)(['taonhanvat', 'thienthu', 'tutien']);
console.log(`Cảnh giới: ${GameCatalog_1.REALMS.length}`);
console.log(`Vật phẩm: ${Object.keys(GameCatalog_1.ITEMS).length}`);
console.log(`Địa vực: ${GameCatalog_1.LOCATIONS.length}`);
console.log(`Công thức: ${GameCatalog_1.RECIPES.length}`);
console.log(`Dị Hỏa: ${RareFireCatalog_1.RARE_FIRES.length}`);
console.log(`Cường địch: ${GameCatalog_1.BOSSES.length}`);
console.log(`Bí cảnh: ${GameCatalog_1.SECRET_REALMS.length}`);
console.log(`Cơ Duyên registry: ${JourneyRegistry_1.JOURNEY_REGISTRY.length} · playable: ${JourneyProductionCatalog_1.PRODUCTION_JOURNEYS.length}`);
console.log(`Hệ thống có lối vào: ${SystemRegistry_1.FEATURES.length}/${SystemRegistry_1.FEATURES.length}`);
console.log(`UI actions: ${SystemRegistry_1.UI_ACTIONS.length}`);
console.log(`Nghĩa vụ cực hiếm: ${ActivityCatalog_1.RARE_DUTIES.length}`);
console.log(`Dị tượng authored: ${ActivityCatalog_1.ANOMALIES.length}`);
console.log(`Runtime materialized tables: ${materializedTables.length - materialized.length}/${materializedTables.length}`);
console.log(`Emoji registry: ${Object.keys(emojis_1.EMOJIS).length} semantic keys`);
console.log(`Item name registry: ${Object.keys(ItemNames_1.ITEM_NAMES).length}/${Object.keys(GameCatalog_1.ITEMS).length}`);
console.log(`Production startup: ${startup.checks} checks · ${startup.commands.length} slash commands`);
if (catalog.length || access.length || fires.length || journeys.length || storage.length || instances.length || runtime.length || !startup.ok) {
    console.error([...catalog, ...access, ...fires, ...journeys, ...storage, ...instances, ...runtime, ...startup.errors].join('\n'));
    process.exit(1);
}
console.log('✅ Audit hoàn tất: catalog, content graph và materialized runtime không có dependency bị đứt.');
