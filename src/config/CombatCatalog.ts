export type CombatMode='PVE'|'ELITE'|'BOSS'|'DUNGEON'|'TOWER'|'WORLD_BOSS'|'BREACH'|'RANKED_PVP'|'SPAR'|'SECT_TRIAL';
export type Persistence='PERSISTENT'|'MIRROR'|'RUN_SNAPSHOT';
export type Strategy='CAN_BANG'|'CONG_KICH'|'THU_VUNG'|'KHONG_CHE'|'BAO_TOAN';
export interface AbilityDefinition{id:string;name:string;kind:'DAMAGE'|'HEAL'|'GUARD';power:number;qiCost:number;cooldown:number;target:'ENEMY'|'ALLY'|'SELF';stackRule?:'UNIQUE'|'REFRESH'|'STACK_CAP'|'STRONGEST'}
export const ABILITIES:Record<string,AbilityDefinition>={
 basic:{id:'basic',name:'Cơ Thức',kind:'DAMAGE',power:1,qiCost:0,cooldown:0,target:'ENEMY'},
 heavy:{id:'heavy',name:'Phá Thức',kind:'DAMAGE',power:1.45,qiCost:18,cooldown:2,target:'ENEMY'},
 guard:{id:'guard',name:'Hộ Thể',kind:'GUARD',power:.38,qiCost:12,cooldown:2,target:'SELF',stackRule:'STRONGEST'},
 mend:{id:'mend',name:'Hồi Nguyên',kind:'HEAL',power:.72,qiCost:20,cooldown:3,target:'ALLY'}
};
export const MODE_RULES:Record<CombatMode,{persistence:Persistence;maxCycles:number;retreat:boolean;rewardOwner:string}>={
 PVE:{persistence:'PERSISTENT',maxCycles:60,retreat:true,rewardOwner:'ENCOUNTER'},ELITE:{persistence:'PERSISTENT',maxCycles:60,retreat:true,rewardOwner:'ENCOUNTER'},BOSS:{persistence:'PERSISTENT',maxCycles:80,retreat:true,rewardOwner:'BOSS_LEDGER'},DUNGEON:{persistence:'PERSISTENT',maxCycles:80,retreat:false,rewardOwner:'DUNGEON_RUN'},TOWER:{persistence:'RUN_SNAPSHOT',maxCycles:100,retreat:true,rewardOwner:'TOWER_RUN'},WORLD_BOSS:{persistence:'PERSISTENT',maxCycles:120,retreat:false,rewardOwner:'WORLD_EVENT'},BREACH:{persistence:'PERSISTENT',maxCycles:80,retreat:false,rewardOwner:'WORLD_EVENT'},RANKED_PVP:{persistence:'MIRROR',maxCycles:80,retreat:false,rewardOwner:'SEASON'},SPAR:{persistence:'MIRROR',maxCycles:80,retreat:true,rewardOwner:'SPAR'},SECT_TRIAL:{persistence:'MIRROR',maxCycles:80,retreat:true,rewardOwner:'SECT_TRIAL'}
};
export function auditCombatCatalog(){const e:string[]=[];for(const a of Object.values(ABILITIES)){if(a.power<0)e.push(`${a.id}: negative power`);if(a.qiCost<0)e.push(`${a.id}: negative cost`);if(a.kind==='GUARD'&&a.stackRule===undefined)e.push(`${a.id}: guard requires explicit stack rule`)}return e}
