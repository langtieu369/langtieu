import db from '../database/database';
import {auditCatalog,ITEMS} from '../config/GameCatalog';
import {auditSystemAccess} from '../config/SystemRegistry';
import {auditNpcCatalog} from '../config/NpcCatalog';
import {auditRareFireCatalog} from '../config/RareFireCatalog';
import {auditJourneyCatalog} from '../config/JourneyCatalog';
import {auditJourneyRegistry} from '../config/JourneyRegistry';
import {auditProductionJourneys} from '../config/JourneyProductionCatalog';
import {auditRuntimeCatalog} from '../config/RuntimeCatalog';
import {auditRuntimeTables} from './RuntimeSystemsService';
import {auditCombatCatalog} from '../config/CombatCatalog';
import {auditActivityCatalog} from '../config/ActivityCatalog';
import {contentResolver} from './RuntimeKernelService';
import {towerService} from './TowerService';
import {storageService} from './StorageService';
import {itemInstanceService} from './ItemInstanceService';
import {realmNpcVisitService} from './RealmNpcVisitService';

export interface StartupAuditResult { ok:boolean; errors:string[]; checks:number; commands:string[] }

export function runStartupAudit(commandNames:string[]):StartupAuditResult {
  const commands=[...commandNames].sort(),errors:string[]=[];
  const expected=['taonhanvat','thienthu','tutien'];
  if(JSON.stringify(commands)!==JSON.stringify(expected))errors.push(`Slash command registry phải đúng ${expected.join(', ')}; hiện có ${commands.join(', ')||'rỗng'}`);
  if(commands.includes('admin')||commands.includes('casino'))errors.push('Command bị loại bỏ vẫn xuất hiện: /admin hoặc /casino');

  errors.push(
    ...auditCatalog(),...auditSystemAccess(),...auditNpcCatalog(),...auditRareFireCatalog(),
    ...auditJourneyCatalog(),...auditJourneyRegistry(),...auditProductionJourneys(),
    ...auditRuntimeCatalog(),...auditRuntimeTables(),...auditCombatCatalog(),
    ...auditActivityCatalog(),...contentResolver.audit(),...towerService.audit(),
    ...storageService.audit(),...itemInstanceService.audit(),...realmNpcVisitService.audit(),
  );

  const integrity=(db.pragma('integrity_check') as {integrity_check:string}[]).map(x=>x.integrity_check);
  if(integrity.length!==1||integrity[0]!=='ok')errors.push(`SQLite integrity_check: ${integrity.join('; ')}`);
  const foreign=db.pragma('foreign_key_check') as unknown[];
  if(foreign.length)errors.push(`SQLite foreign_key_check: ${foreign.length} vi phạm`);

  const persisted=db.prepare('SELECT id,name,emoji FROM items').all() as {id:string;name:string;emoji:string}[];
  const byId=new Map(persisted.map(x=>[x.id,x]));
  for(const item of Object.values(ITEMS)){
    const row=byId.get(item.id);
    if(!row)errors.push(`${item.id}: chưa đồng bộ vào database`);
    else if(row.name!==item.name||row.emoji!==item.emoji)errors.push(`${item.id}: database lệch ItemNames/emojis registry`);
  }
  return{ok:errors.length===0,errors:[...new Set(errors)],checks:14,commands};
}
