import db from '../database/database';
import {FireMastery,RARE_FIRE_BY_ID} from '../config/RareFireCatalog';

export interface OwnedRareFire{user_id:string;fire_id:string;mastery:FireMastery;provenance:string;placed_at:string|null;acquired_at:number}

export class RareFireService{
 owns(uid:string,fireId:string){return !!db.prepare('SELECT 1 FROM rare_fire_ownership WHERE user_id=? AND fire_id=?').get(uid,fireId)}
 get(uid:string,fireId:string){return (db.prepare('SELECT * FROM rare_fire_ownership WHERE user_id=? AND fire_id=?').get(uid,fireId) as OwnedRareFire|undefined)??null}
 list(uid:string){return db.prepare('SELECT * FROM rare_fire_ownership WHERE user_id=? ORDER BY acquired_at').all(uid) as OwnedRareFire[]}
 acquire(uid:string,fireId:string,provenance:string,at=Math.floor(Date.now()/1000)){
  if(!RARE_FIRE_BY_ID[fireId])return{ok:false,message:'Dị Hỏa không tồn tại trong Hỏa Phổ.'};
  if(!provenance.trim())return{ok:false,message:'Dị Hỏa bắt buộc có provenance.'};
  const result=db.prepare(`INSERT OR IGNORE INTO rare_fire_ownership(user_id,fire_id,mastery,provenance,acquired_at) VALUES(?,?,'so_dan',?,?)`).run(uid,fireId,provenance.trim(),at);
  return result.changes?{ok:true,message:`Đã ghi nhận ${RARE_FIRE_BY_ID[fireId].name} vào Hỏa Phổ.`}:{ok:false,message:'Người chơi đã sở hữu Dị Hỏa này; không tạo bản trùng.'};
 }
 place(uid:string,fireId:string,placementId:string){
  if(!this.owns(uid,fireId))return{ok:false,message:'Người chơi chưa sở hữu Dị Hỏa này.'};
  if(!placementId.trim())return{ok:false,message:'Hỏa Vị không hợp lệ.'};
  db.prepare('UPDATE rare_fire_ownership SET placed_at=? WHERE user_id=? AND fire_id=?').run(placementId.trim(),uid,fireId);
  return{ok:true,message:'Đã an trí Dị Hỏa tại Hỏa Vị.'};
 }
 unplace(uid:string,fireId:string){db.prepare('UPDATE rare_fire_ownership SET placed_at=NULL WHERE user_id=? AND fire_id=?').run(uid,fireId)}
 canUse(uid:string,fireId:string){const row=this.get(uid,fireId);return !!row?.placed_at}
 setMastery(uid:string,fireId:string,mastery:FireMastery){
  if(!this.owns(uid,fireId))return false;
  db.prepare('UPDATE rare_fire_ownership SET mastery=? WHERE user_id=? AND fire_id=?').run(mastery,uid,fireId);return true;
 }
}
export const rareFireService=new RareFireService();
