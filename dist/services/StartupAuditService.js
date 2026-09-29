"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStartupAudit = runStartupAudit;
const database_1 = __importDefault(require("../database/database"));
const GameCatalog_1 = require("../config/GameCatalog");
const SystemRegistry_1 = require("../config/SystemRegistry");
const NpcCatalog_1 = require("../config/NpcCatalog");
const RareFireCatalog_1 = require("../config/RareFireCatalog");
const JourneyCatalog_1 = require("../config/JourneyCatalog");
const JourneyRegistry_1 = require("../config/JourneyRegistry");
const JourneyProductionCatalog_1 = require("../config/JourneyProductionCatalog");
const RuntimeCatalog_1 = require("../config/RuntimeCatalog");
const RuntimeSystemsService_1 = require("./RuntimeSystemsService");
const CombatCatalog_1 = require("../config/CombatCatalog");
const ActivityCatalog_1 = require("../config/ActivityCatalog");
const RuntimeKernelService_1 = require("./RuntimeKernelService");
const TowerService_1 = require("./TowerService");
const StorageService_1 = require("./StorageService");
const ItemInstanceService_1 = require("./ItemInstanceService");
const RealmNpcVisitService_1 = require("./RealmNpcVisitService");
function runStartupAudit(commandNames) {
    const commands = [...commandNames].sort(), errors = [];
    const expected = ['taonhanvat', 'thienthu', 'tutien'];
    if (JSON.stringify(commands) !== JSON.stringify(expected))
        errors.push(`Slash command registry phải đúng ${expected.join(', ')}; hiện có ${commands.join(', ') || 'rỗng'}`);
    if (commands.includes('admin') || commands.includes('casino'))
        errors.push('Command bị loại bỏ vẫn xuất hiện: /admin hoặc /casino');
    errors.push(...(0, GameCatalog_1.auditCatalog)(), ...(0, SystemRegistry_1.auditSystemAccess)(), ...(0, NpcCatalog_1.auditNpcCatalog)(), ...(0, RareFireCatalog_1.auditRareFireCatalog)(), ...(0, JourneyCatalog_1.auditJourneyCatalog)(), ...(0, JourneyRegistry_1.auditJourneyRegistry)(), ...(0, JourneyProductionCatalog_1.auditProductionJourneys)(), ...(0, RuntimeCatalog_1.auditRuntimeCatalog)(), ...(0, RuntimeSystemsService_1.auditRuntimeTables)(), ...(0, CombatCatalog_1.auditCombatCatalog)(), ...(0, ActivityCatalog_1.auditActivityCatalog)(), ...RuntimeKernelService_1.contentResolver.audit(), ...TowerService_1.towerService.audit(), ...StorageService_1.storageService.audit(), ...ItemInstanceService_1.itemInstanceService.audit(), ...RealmNpcVisitService_1.realmNpcVisitService.audit());
    const integrity = database_1.default.pragma('integrity_check').map(x => x.integrity_check);
    if (integrity.length !== 1 || integrity[0] !== 'ok')
        errors.push(`SQLite integrity_check: ${integrity.join('; ')}`);
    const foreign = database_1.default.pragma('foreign_key_check');
    if (foreign.length)
        errors.push(`SQLite foreign_key_check: ${foreign.length} vi phạm`);
    const persisted = database_1.default.prepare('SELECT id,name,emoji FROM items').all();
    const byId = new Map(persisted.map(x => [x.id, x]));
    for (const item of Object.values(GameCatalog_1.ITEMS)) {
        const row = byId.get(item.id);
        if (!row)
            errors.push(`${item.id}: chưa đồng bộ vào database`);
        else if (row.name !== item.name || row.emoji !== item.emoji)
            errors.push(`${item.id}: database lệch ItemNames/emojis registry`);
    }
    return { ok: errors.length === 0, errors: [...new Set(errors)], checks: 14, commands };
}
