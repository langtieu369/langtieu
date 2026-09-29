import db from '../database/database';
import {assertBotOwner} from '../config/permissions';
import {userRepository} from '../database/repositories/UserRepository';
import {inventoryRepository} from '../database/repositories/InventoryRepository';
import {ITEMS} from '../config/GameCatalog';

function audit(ownerId:string,action:string,targetId:string,detail:string){
  db.prepare('INSERT INTO admin_audit(owner_id,action,target_id,detail,created_at) VALUES(?,?,?,?,?)')
    .run(ownerId,action,targetId,detail,Math.floor(Date.now()/1000));
}
export const adminService={
 adjustCurrency(ownerId:string,targetId:string,currency:'lt'|'cplt',amount:number){assertBotOwner(ownerId);const u=userRepository.get(targetId);if(!u)return{ok:false,message:'Không tìm thấy đạo hồ mục tiêu.'};const col=currency==='lt'?'coin_ha_pham':'knb';const now=Number((u as any)[col]||0),next=Math.max(0,now+Math.trunc(amount));userRepository.update(targetId,{[col]:next} as any);audit(ownerId,'ADJUST_CURRENCY',targetId,JSON.stringify({currency,amount,before:now,after:next}));return{ok:true,message:`✅ ${currency==='lt'?'Linh Thạch':'CPLT'}: **${now.toLocaleString()} → ${next.toLocaleString()}**.`}},
 setCurrency(ownerId:string,targetId:string,currency:'lt'|'cplt',value:number){assertBotOwner(ownerId);const u=userRepository.get(targetId);if(!u)return{ok:false,message:'Không tìm thấy đạo hồ mục tiêu.'};const col=currency==='lt'?'coin_ha_pham':'knb';const now=Number((u as any)[col]||0),next=Math.max(0,Math.trunc(value));userRepository.update(targetId,{[col]:next} as any);audit(ownerId,'SET_CURRENCY',targetId,JSON.stringify({currency,before:now,after:next}));return{ok:true,message:`✅ Đã đặt ${currency==='lt'?'Linh Thạch':'CPLT'} thành **${next.toLocaleString()}**.`}},
 adjustItem(ownerId:string,targetId:string,itemId:string,amount:number){assertBotOwner(ownerId);const item=ITEMS[itemId];if(!item)return{ok:false,message:`Không có vật phẩm mã **${itemId}** trong GameCatalog.`};const q=Math.trunc(amount);if(q===0)return{ok:false,message:'Số lượng thay đổi không thể bằng 0.'};if(q>0)inventoryRepository.add(targetId,itemId,q);else {const have=inventoryRepository.quantity(targetId,itemId);const remove=Math.min(have,Math.abs(q));if(remove>0)inventoryRepository.remove(targetId,itemId,remove)}audit(ownerId,'ADJUST_ITEM',targetId,JSON.stringify({itemId,amount:q}));return{ok:true,message:`✅ ${item.emoji} **${item.name}** ${q>0?'+':''}${q}.`}},
 auditRecent(ownerId:string,limit=10){assertBotOwner(ownerId);return db.prepare('SELECT * FROM admin_audit ORDER BY id DESC LIMIT ?').all(Math.max(1,Math.min(25,limit))) as any[]}
};
